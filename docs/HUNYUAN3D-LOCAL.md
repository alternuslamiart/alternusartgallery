# Hunyuan3D 2.1 local Image to 3D

This integration adds a real shape-only provider to the existing Casynus studio
chat. It preserves the existing studios, providers, layout, colors and controls.
It does not provide text-to-3D, generated textures, parametric CAD or BIM.

## Start on this workstation

From `C:\Users\Bulzart\Desktop\alternusai`, in separate PowerShell terminals:

```powershell
# Existing environment; no installation or checkpoint download needed.
& C:\Users\Bulzart\miniconda3\envs\hunyuan3d\python.exe -u ai-services/hunyuan_shape_service.py
```

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3000
```

The ignored `.env.local` is configured with:

```dotenv
HUNYUAN_API_URL=http://127.0.0.1:8081
```

Existing NextAuth settings and a valid `DATABASE_URL` are required. `DIRECT_URL`
is used by Prisma schema operations. Neither credentials nor private worker URLs
are sent to the browser. If using worker authentication, set the same
`HUNYUAN_API_TOKEN` in the worker process environment and Next's `.env.local`.
`HUNYUAN_PORT` optionally changes the worker port. `HUNYUAN_DATA_DIR` optionally
changes its staging directory; the default is `storage/hunyuan-worker`.
`ASSET_UPLOAD_DIR` controls application storage, default `storage/assets`.

Do not use the upstream `api_server.py` for this path: its `ModelWorker` imports
and initializes the paint pipeline even for shape requests, and `/status` waits
for a textured output. The Casynus adapter keeps the upstream `/send`, `/status`
and `/health` conventions, adds a binary asset route, and calls the exact
`test_shape.py` shape pipeline without importing that texture worker.

## User workflow

1. Sign in and open `/casynus`, `/infrastructure`, or `/interior?workspace=3d`.
2. In the existing chat's AI mode selector, choose **Hunyuan3D · Image to 3D**.
3. Use the existing paperclip to attach PNG, JPEG or WebP: 32–4096 pixels on
   each axis, static image, at most 3 MB. Use an isolated subject for best results.
4. Send the image; text is optional and is a label, not a model input. The
   current project must save to the authenticated workspace before submission.
5. Chat monitors the real worker state. No percentage is invented during
   inference. A completed asset offers **Insert into Studio**.
6. Insert adds a selectable model with the full source geometry, normalized to
   a longest dimension of two meters and placed on the scene's ground plane.
   Existing selection, move/rotate/scale, dimensions, material controls,
   duplicate/delete and Undo/Redo apply. Selected object context includes its
   asset metadata. Native chat commands remain limited to supported scene edits.
7. The existing project snapshots and identity-scoped IndexedDB recovery retain
   the asset reference and transforms. Reopening fetches the private GLB again.
   The existing **AI generation jobs** menu can recover completed results.

Only the shared 3D studio chat receives this integration; standalone `/aichat`
and Interior's default 2D drafting surface do not insert 3D assets. Existing
text providers and Meshy/Tripo workflows are retained.

## API contracts

Browser → Next.js (existing routes, existing NextAuth/workspace authorization):

| Endpoint | Contract |
| --- | --- |
| `GET /api/ai3d/providers` | Configured providers and display labels; no keys/URLs. |
| `POST /api/ai3d/jobs` | JSON `{requestId,projectId,studio,provider:"hunyuan",prompt,image}`; `image` is a PNG/JPEG/WebP base64 data URL. Returns 202 with persisted job DTO. |
| `GET /api/ai3d/jobs?project=<id>` | User AND workspace scoped jobs, up to 30. |
| `GET /api/ai3d/jobs/<id>` | Refresh worker status; never runs inference synchronously. |
| `GET /api/ai3d/jobs/<id>/asset` | Owned completed GLB from private application storage. |

Jobs reuse `AIProviderJob` with the existing `casynus-ai3d` discriminator and
`MODEL_GENERATION` type. API states remain the existing `QUEUED`, `RUNNING`,
`SUCCEEDED`, `FAILED`/`CANCELED` contract. The worker does not support cancellation;
stopping browser monitoring does not cancel GPU inference. Resume does not
submit another generation. A repeated request ID must match project, prompt,
provider and image hash. Images themselves are not stored in PostgreSQL.

Next.js → loopback worker (25-second HTTP deadlines, no redirects):

| Endpoint | Contract |
| --- | --- |
| `GET /health` | HTTP liveness, `pipeline_loaded`, queue count, `mode:"shape-only"`. Model/CUDA loading is lazy. |
| `POST /send` | JSON `{image:<base64 or data URL>,texture:false}` → 202 `{uid}`. Full Pillow decode and dimensions checked before enqueue. |
| `GET /status/<uid>` | `{uid,status:"queued"|"processing"|"completed"|"failed",created,error?}`. No base64 GLB in status responses. |
| `GET /asset/<uid>` | Binary completed GLB; unknown/unfinished/expired jobs fail explicitly. |

Worker binds **only `127.0.0.1`**, rejects browser Origin headers, and optionally
requires a bearer token on every endpoint. There is one daemon inference thread,
one lazy cached CUDA pipeline and four queue slots. It uses the verified model
ID/subfolder and default inference call, with Hugging Face/Transformers offline
mode. It does not reinstall Python/PyTorch or download checkpoints. A missing
cache is a failed job. CUDA OOM becomes an explicit failure and GPU cache cleanup.

Temporary input PNGs are removed after each attempt. Worker metadata survives
restart; interrupted jobs become failed. Staged output retention is 24 hours,
pruned at startup/submission, with 64 job records and a 1 GB staging cap.
Completed GLBs are copied by Next before reporting SUCCEEDED. Private application
storage is deterministic/idempotent per workspace/job and capped at 1 GB per
workspace; persistent project sources are not silently removed with staging.
Archive unused sources deliberately if the cap is reached. GLBs are bounded to
20 MB. Runtime source cache is cleared when the editor unmounts and permits
eight sources with at most one million vertices each. Documents permit eight
distinct generated sources; original embedded-mesh document budgets are unchanged.

## Persistence and production boundary

GLB bytes live in private filesystem storage. PostgreSQL contains job metadata,
storage keys and small scene references, never the GLB binary or expanded model
vertex arrays. All downloads recheck existing user/workspace job ownership.
No public directory or local disk path is returned to the browser. No migration
or existing table replacement is required. Back up both the database and asset
volume; copying only project JSON does not package its referenced GLBs.

This delivery is **local development only**. Production refuses localhost worker
configuration by default. `HUNYUAN_LOCAL_DEVELOPMENT=1` is an explicit local
`next build`/`next start` QA override, and also requires a worker token. Never set
that override on Vercel. No production environment or public service was created.

A remote adapter is prepared for a server-configured HTTPS worker origin with a
required `HUNYUAN_API_TOKEN` and disabled redirects. A production worker should
remain behind an authenticated TLS gateway, with durable jobs and private object
storage. Vercel cannot reach this computer's loopback address and its ephemeral
filesystem is unsuitable for these stored GLBs or 12 MB asset responses. Before
public use, configure the optional private Supabase Storage adapter with
`SUPABASE_URL`, server-only `SUPABASE_SERVICE_ROLE_KEY` and
`HUNYUAN_STORAGE_BUCKET` naming an existing private bucket. Upload and signing
reject public buckets; ownership-authorized downloads use 120-second signed URLs.
Remote production configuration requires these storage values. Provision the
remote GPU worker, and complete deployment/auth/license review. Merely setting
a remote URL does not supply that infrastructure.

## License inspection

Inspected the installed `ai-services/Hunyuan3D-2.1/LICENSE` (Community License)
and the upstream worker's conflicting non-commercial header. The license grant
is limited to its Territory, which excludes **the European Union, United Kingdom
and South Korea** (§§1.l, 2, 5.c). This concerns use of the works and outputs,
not just public distribution; local testing does not establish permission in an
excluded territory. The workstation's Europe/Berlin timezone is not proof of
physical location or license entitlement. Resolve applicable authorization with
Tencent before any rollout or any use outside the stated Territory.

Additional terms include a separate Tencent license for entities above one
million monthly active users at the release-date threshold (§4); license-copy,
modified-file and Notice obligations for applicable redistribution (§3);
disclosure of the actual service provider and no Tencent affiliation (§3.e);
Acceptable Use Policy compliance and restrictions on improving other AI models
(§5). Outputs alone are not Model Derivatives (§1.g); Tencent disclaims rights
in outputs (§6.d), subject to the other terms. This is a record of the inspected
license, not a grant of rights. Model caches, upstream repository, checkpoints,
environments and generated files are excluded from Git.

## Verification commands and current limits

```powershell
npm test
npm run typecheck
npm run lint
npm run build
& C:\Users\Bulzart\miniconda3\envs\hunyuan3d\python.exe tests/test_hunyuan_worker.py
$env:STUDIO_QA_URL='http://localhost:3033'
node scripts/verify-hunyuan-studios.mjs
```

The browser verifier uses isolated auth/database/job HTTP test adapters and a
real local GLB, never fake geometry. Set `HUNYUAN_TEST_GLB` to another real shape
GLB, including a fresh worker result. It verifies all three 3D routes and saves
light/dark screenshots under ignored `.tmp/hunyuan-browser-*`.

Verified on 2026-10-24: worker startup, health, malformed-image rejection,
actual CUDA inference using the cached checkpoint, processing→completed state,
and binary download of a new **12,146,620-byte GLB**. Both the prior demo and
fresh GLB passed full-vertex rendering, selection, transforms, duplicate,
history and reference restoration tests. Worker CPU validation/auth tests passed.
Type checking and a production build passed; the first build hit a Prisma DLL
lock held by an earlier Next server, then passed after that server was stopped.
Full lint still reports pre-existing unused-code errors in unrelated files.

On 2026-10-25, `node scripts/verify-hunyuan-environment.mjs` passed read-only
SELECT 1 on both configured pooler URLs, superseding the invalid URL blocker.
Authentication has not been bypassed. Verify one signed-in image→generation→insert
and logout/login→project reopen before declaring the primary acceptance fully
verified. Browser and final check results are recorded in `PROGRESS.md`.

The toolbar AI 3D Generate toggle selects image generation and restores the
previous text provider when toggled off. Worker phases and actual diffusion
callbacks drive status; temporary polling failures reconnect without resubmitting.
Completed geometry previews in the existing viewport before Insert into Studio
commits it. Chat also offers Preview 3D and Download GLB. Stop monitoring leaves
the worker job running and resumable.

`node scripts/verify-hunyuan-studios.mjs --live` opts into real local database
writes, credentials sign-in, GPU submission and an isolated QA principal; it does
not test email delivery. `--resume-live` resumes a recent isolated QA job. Active
jobs retain QA records for resumption; completed runs clean their owned records.
The default browser verifier continues to use mocked auth/database/job HTTP.

## Changed implementation files

- Worker: `ai-services/hunyuan_shape_service.py`.
- Provider/transport/storage: `src/lib/ai3d/{hunyuan.mjs,hunyuan.d.mts,
  hunyuan-assets.ts,providers.mjs,providers.d.mts,jobs.ts,client.mjs,client.d.mts}`.
- Existing jobs API: `src/app/api/ai3d/jobs/route.ts`, `[id]/route.ts`,
  `[id]/asset/route.ts`.
- Existing chat/studio: `StudioAIChat.tsx`, `conversation-storage.mjs`,
  `SceneWorkbench.tsx`, `SceneViewport.tsx`, `src/lib/studio-ai.d.mts`.
- Scene data/loading: `src/lib/scene/{generated-assets.mjs,generated-assets.d.mts,
  document.mjs,document.d.mts,geometry.mjs}`.
- Validation: `tests/{hunyuan.test.mjs,hunyuan-assets.test.mjs,ai3d-jobs.test.mjs,test_hunyuan_worker.py}`,
  `scripts/verify-hunyuan-studios.mjs`.
- Configuration/documentation: `.env.example`, `.gitignore`, this guide,
  `PROGRESS.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `TODO.md`.
- Ignored local configuration: `.env.local` now contains the loopback worker URL.
