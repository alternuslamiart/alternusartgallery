"""Casynus shape-only adapter. Reuses the verified test_shape.py pipeline.

Run with the existing hunyuan3d Python environment; one process, one GPU job.
No paint, rembg, Blender or DeepSpeed imports. No checkpoint downloads.
"""
import base64
import gc
import io
import json
import os
from pathlib import Path
import queue
import secrets
import sys
import threading
import time
import uuid
from contextlib import contextmanager

os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from PIL import Image, UnidentifiedImageError

ROOT = Path(__file__).resolve().parent
REPO = ROOT / "Hunyuan3D-2.1"
DATA = Path(os.getenv("HUNYUAN_DATA_DIR", str(ROOT.parent / "storage" / "hunyuan-worker")))
DATA.mkdir(parents=True, exist_ok=True)
TOKEN = os.getenv("HUNYUAN_API_TOKEN", "")
MAX_IMAGE = 3_000_000
MAX_OUTPUT = 20_000_000
INFERENCE_STEPS = 50  # The installed pipeline's verified default; not an estimate.
Image.MAX_IMAGE_PIXELS = 4096 * 4096
jobs = {}
lock = threading.RLock()
pending = queue.Queue(maxsize=4)
pipeline = None
app = FastAPI(title="Casynus Hunyuan3D shape worker", docs_url=None, redoc_url=None)


def save(job):
    target = DATA / f"{job['uid']}.json"
    temp = target.with_suffix(".tmp")
    temp.write_text(json.dumps(job), encoding="utf-8")
    temp.replace(target)


def phase(job, value, **details):
    with lock:
        job.update(phase=value, **details)
        save(job)


def sampling_callback(job):
    def callback(step, _timestep, _outputs):
        # Official pipeline callback runs after an actual diffusion step. Its
        # final invocation precedes _export(), VAE decoding and mesh extraction.
        completed = min(INFERENCE_STEPS, int(step) + 1)
        phase(job, "processing_mesh" if completed == INFERENCE_STEPS else "generating_geometry",
              sampling_step=completed, sampling_steps=INFERENCE_STEPS)
    return callback


@contextmanager
def mapped_checkpoint_loading(torch):
    """Keep the upstream pipeline/config while avoiding a full RAM copy of weights.

    PyTorch 2.5 supports mmap on the cached ZIP checkpoint. The temporary wrapper
    is used only by the single pipeline-loading thread and restored in finally.
    Initialize parameters in the pipeline's existing fp16 dtype as well, rather
    than allocating full fp32 CPU modules before converting them to fp16.
    No upstream files, weights, final model dtype or inference settings change.
    """
    original = torch.load
    original_dtype = torch.get_default_dtype()
    torch.set_default_dtype(torch.float16)
    def load(file, *args, **kwargs):
        if isinstance(file, (str, os.PathLike)) and str(file).endswith(".ckpt"):
            with open(file, "rb") as checkpoint:
                if checkpoint.read(4) == b"PK\x03\x04":
                    kwargs["mmap"] = True
        return original(file, *args, **kwargs)
    torch.load = load
    try:
        yield
    finally:
        torch.load = original
        torch.set_default_dtype(original_dtype)


def prune():
    # Completed worker results are staging files, copied to app storage on poll.
    for uid, job in list(jobs.items()):
        if job["status"] not in ("queued", "processing") and time.time() - job["created"] > 86400:
            for extension in ("json", "png", "glb", "tmp"):
                (DATA / f"{uid}.{extension}").unlink(missing_ok=True)
            del jobs[uid]


for file in DATA.glob("*.json"):
    try:
        job = json.loads(file.read_text(encoding="utf-8"))
        if str(uuid.UUID(job["uid"])) != file.stem:
            continue
        if job["status"] in ("queued", "processing"):
            job.update(status="failed", error="GPU worker restarted during generation. Submit a new job.")
            save(job)
            for extension in ("png", "glb"):
                (DATA / f"{job['uid']}.{extension}").unlink(missing_ok=True)
        jobs[job["uid"]] = job
    except (ValueError, KeyError):
        continue
prune()


@app.middleware("http")
async def access(request: Request, call_next):
    # Browser calls must go through authenticated Next.js, including on localhost.
    if request.headers.get("origin"):
        from fastapi.responses import JSONResponse
        return JSONResponse({"error": "Use the Casynus backend."}, status_code=403)
    if TOKEN and not secrets.compare_digest(request.headers.get("authorization", ""), f"Bearer {TOKEN}"):
        from fastapi.responses import JSONResponse
        return JSONResponse({"error": "Unauthorized worker request."}, status_code=401)
    return await call_next(request)


def decode_image(value):
    if not isinstance(value, str) or len(value) > MAX_IMAGE * 4 // 3 + 100:
        raise ValueError("Image must be at most 3 MB.")
    if value.startswith("data:"):
        prefix, value = value.split(",", 1)
        if prefix not in ("data:image/png;base64", "data:image/jpeg;base64", "data:image/webp;base64"):
            raise ValueError("Use PNG, JPEG or WebP.")
    raw = base64.b64decode(value, validate=True)
    if not raw or len(raw) > MAX_IMAGE:
        raise ValueError("Image must be at most 3 MB.")
    with Image.open(io.BytesIO(raw)) as image:
        if image.format not in ("PNG", "JPEG", "WEBP") or getattr(image, "n_frames", 1) != 1:
            raise ValueError("Use a static PNG, JPEG or WebP.")
        if not all(32 <= n <= 4096 for n in image.size):
            raise ValueError("Image dimensions must be 32–4096 pixels.")
        image.load()
        result = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    return result


def run():
    global pipeline
    while True:
        uid = pending.get()
        job = jobs[uid]
        try:
            with lock:
                job.update(status="processing")
                save(job)
            import torch
            if not torch.cuda.is_available():
                raise RuntimeError("CUDA is unavailable.")
            if pipeline is None:
                phase(job, "loading_model")
                sys.path.insert(0, str(REPO / "hy3dshape"))
                from hy3dshape.pipelines import Hunyuan3DDiTFlowMatchingPipeline
                with mapped_checkpoint_loading(torch):
                    pipeline = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
                        "tencent/Hunyuan3D-2.1", subfolder="hunyuan3d-dit-v2-1")
            with Image.open(DATA / f"{uid}.png") as image, torch.inference_mode():
                # Intentionally use the exact successful test_shape.py defaults.
                phase(job, "generating_geometry")
                mesh = pipeline(image=image.copy(), callback=sampling_callback(job), callback_steps=1)[0]
                phase(job, "processing_mesh")
                target = DATA / f"{uid}.glb"
                mesh.export(str(target))
                del mesh
            if not 12 <= target.stat().st_size <= MAX_OUTPUT:
                target.unlink(missing_ok=True)
                raise RuntimeError("Generated GLB exceeds the 20 MB import limit.")
            job.update(status="completed", phase="completed")
        except Exception as error:
            import traceback
            traceback.print_exc()
            oom = "out of memory" in str(error).lower()
            job.update(status="failed", phase="failed", error="CUDA out of memory. Close other GPU applications and retry." if oom else "Shape inference failed. Inspect the GPU service log.")
            (DATA / f"{uid}.glb").unlink(missing_ok=True)
        finally:
            (DATA / f"{uid}.png").unlink(missing_ok=True)
            gc.collect()
            if "torch" in sys.modules:
                try:
                    sys.modules["torch"].cuda.empty_cache()
                except Exception:
                    pass  # A device failure must not kill the queue/status thread.
            with lock:
                save(job)
            pending.task_done()


threading.Thread(target=run, daemon=True, name="single-gpu-worker").start()


@app.get("/health")
def health():
    return {"status": "healthy", "pipeline_loaded": pipeline is not None, "queued": pending.qsize(), "mode": "shape-only"}


@app.post("/send", status_code=202)
async def send(request: Request):
    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > 4_001_000:
            raise HTTPException(413, "Image request exceeds 4 MB.")
    try:
        params = json.loads(body)
        if not isinstance(params, dict) or set(params) - {"image", "texture"} or params.get("texture", False) is not False:
            raise ValueError("Only shape-only image requests are supported.")
        image = decode_image(params.get("image"))
    except (ValueError, UnidentifiedImageError, Image.DecompressionBombError, OSError):
        raise HTTPException(400, "Use a valid static PNG, JPEG or WebP, 32–4096 pixels, at most 3 MB.")
    with lock:
        prune()
        disk = sum(p.stat().st_size for p in DATA.iterdir() if p.is_file())
        if pending.full() or len(jobs) >= 64 or disk > 1_000_000_000:
            raise HTTPException(429, "Worker capacity reached; retry after pending jobs finish or staged outputs expire.")
        uid = str(uuid.uuid4())
        image.save(DATA / f"{uid}.png")
        job = {"uid": uid, "status": "queued", "phase": "queued", "created": time.time()}
        jobs[uid] = job
        save(job)
        pending.put_nowait(uid)
    image.close()
    return {"uid": uid}


def lookup(uid):
    with lock:
        job = jobs.get(uid)
        if not job:
            raise HTTPException(404, "Generation not found or expired.")
        return dict(job)


@app.get("/status/{uid}")
def status(uid: str):
    return lookup(uid)


@app.get("/asset/{uid}")
def asset(uid: str):
    job = lookup(uid)
    if job["status"] != "completed":
        raise HTTPException(409, "Generation is not completed.")
    target = DATA / f"{job['uid']}.glb"
    if not target.exists():
        raise HTTPException(410, "Worker output expired.")
    return FileResponse(target, media_type="model/gltf-binary", filename="generated.glb")


if __name__ == "__main__":
    import uvicorn
    # Do not add multiple uvicorn workers: each would load another GPU model.
    uvicorn.run(app, host="127.0.0.1", port=int(os.getenv("HUNYUAN_PORT", "8081")), workers=1)
