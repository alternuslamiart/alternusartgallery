"""CPU-only worker contract tests; never load a pipeline or enqueue inference."""
import base64
import importlib.util
import io
import os
from pathlib import Path
import tempfile
import unittest

temp = tempfile.TemporaryDirectory()
os.environ["HUNYUAN_DATA_DIR"] = temp.name
os.environ["HUNYUAN_API_TOKEN"] = "test-worker-token"
spec = importlib.util.spec_from_file_location("shape_service", Path(__file__).parents[1] / "ai-services" / "hunyuan_shape_service.py")
service = importlib.util.module_from_spec(spec)
spec.loader.exec_module(service)
from fastapi.testclient import TestClient
from PIL import Image


class WorkerTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(service.app)
        self.headers = {"Authorization": "Bearer test-worker-token"}

    def image(self, size=(64, 64), kind="PNG"):
        output = io.BytesIO()
        Image.new("RGB", size).save(output, format=kind)
        return base64.b64encode(output.getvalue()).decode()

    def test_image_decode_and_limits(self):
        for kind in ("PNG", "JPEG", "WEBP"):
            image = service.decode_image(self.image(kind=kind))
            self.assertEqual(image.size, (64, 64))
            image.close()
        for value in (None, "bad", self.image((31, 64)), self.image((4097, 32)), "A" * 4_000_101):
            with self.assertRaises((ValueError, OSError)):
                service.decode_image(value)

    def test_auth_origin_and_health(self):
        self.assertEqual(self.client.get("/health").status_code, 401)
        self.assertEqual(self.client.get("/health", headers={**self.headers, "Origin": "http://localhost:3000"}).status_code, 403)
        self.assertEqual(self.client.get("/health", headers=self.headers).json()["mode"], "shape-only")

    def test_reject_malformed_texture_and_unknown_jobs(self):
        for body in ({"image": "bad"}, {"image": self.image(), "texture": True}, {"prompt": "chair"}, []):
            self.assertEqual(self.client.post("/send", headers=self.headers, json=body).status_code, 400)
        self.assertEqual(self.client.get("/status/unknown", headers=self.headers).status_code, 404)
        self.assertEqual(self.client.get("/asset/unknown", headers=self.headers).status_code, 404)
        self.assertEqual(service.pending.qsize(), 0)


if __name__ == "__main__":
    unittest.main()
