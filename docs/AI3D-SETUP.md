# Casynus AI → editable 3D scenes

## Deployment configuration

Add server environment variables in Vercel for the deployment environment and
redeploy. Do not use `NEXT_PUBLIC_` for provider keys.

| Capability | Required key | Model setting |
| --- | --- | --- |
| Meshy text → GLB with PBR textures | `MESHY_API_KEY` | `MESHY_MODEL=latest` |
| Tripo text → GLB with PBR textures | `TRIPO_API_KEY` | `TRIPO_MODEL=v3.1-20260211` |
| Structured scene planning/editing | `GEMINI_API_KEY` or `GROQ_API_KEY` | Existing `GEMINI_MODEL` / `GROQ_MODEL` |

Only configure the providers you intend to use. Meshy/Tripo appear in the 3D
assistant after their server key is set. You remains research chat. Provider
access/billing/credits must be valid for the selected model.

Mesh generation requires a signed-in user and the existing PostgreSQL/Prisma
workspace database (`DATABASE_URL` and production authentication configuration).
The implementation uses existing `AIProviderJob` rows with
`type=MODEL_GENERATION`, `input.kind=casynus-ai3d`. No schema change or new SDK
is needed; the deployed database must already match `prisma/schema.prisma`.

## Use

1. Open Architecture `/casynus`, Infrastructure `/infrastructure`, or Interior
   3D `/interior?workspace=3d`. `/interior` keeps the original 2D sketcher; this
   integration does not turn its plan geometry into a generated 3D model.
2. Choose Meshy or Tripo in the existing assistant and describe a model
   (up to 600 characters). Generation starts through authenticated backend
   APIs. A progress message reports the provider job status.
3. Inspect the real GLB preview. **Apply** commits the imported editable mesh
   hierarchy as one undoable action; **Discard** leaves the scene unchanged.
4. Open the sidebar project `…` menu → File → **AI generation jobs** to resume
   monitoring/import after refresh or a stopped request. Resume does not create
   another paid task. The job belongs to the original project and user.
5. Save the scene or export GLB/JSON. Imported geometry/materials/textures are
   serialized by the existing project snapshot system.

Gemini/Groq scene mode is enabled initially in the 3D editor. Prompts become
validated template/create/move/transform/material/delete/environment operations,
with preview and Apply/Discard. Disable scene commands to use ordinary chat.
AI output is never evaluated as JavaScript, Python or Blender code.

## Provider and persistence behavior

- Meshy creates a geometry preview task, then a PBR refinement task. Both
  stages use provider credits. A database compare-and-update claim ensures
  simultaneous polling does not submit refinement twice.
- Tripo uses its v3 text-to-model endpoint and task query endpoint, with PBR
  textures and a bounded face count. Meshy uses its v2 text-to-3D endpoints.
- Requests are persisted before provider submission, with a unique request ID.
  An ambiguous submission is not automatically retried. If connectivity fails
  during submission, check the provider dashboard before creating another job.
- Polling is resumable and serverless-friendly; no in-memory worker or browser
  localStorage is the job database. Stopping the UI stops monitoring, not an
  already running provider task. No upstream cancellation/refund is claimed.
- Jobs/results are authorized by both workspace ID and user ID. Results from
  another project cannot be inserted through the client generation helper.
- Source CDN links can expire according to provider retention. Resume refreshes
  the successful task's link. Import and save the project to preserve editable
  scene data; this is not permanent archival of the original provider file.

## Limits and errors

- Existing import/document limits apply: 20 MB GLB input, 8 MB scene JSON,
  1000 scene nodes and 200,000 imported vertices. Over-budget results fail
  validation without altering the scene; the provider source remains in jobs.
- CDN download is preferred. Official provider asset hosts are explicitly
  allowed by CSP. If CORS prevents download, the authenticated same-origin
  proxy handles GLBs up to 4 MB, below the Vercel response limit.
  Larger files require working CDN CORS or a direct source download/import.
- Only HTTPS Meshy/Tripo asset domains are accepted. Proxy requests do not
  forward provider API keys and do not follow redirects.
- Skinned/animated/compressed or otherwise unsupported GLBs are rejected by
  the existing importer. Generated meshes do not become semantic parametric
  walls/doors merely because the prompt describes a building.
- Provider errors, quotas, missing keys, storage failures and import failures
  are surfaced as errors. No local demo is substituted for a provider result.

## Verification

Automated provider protocol/service tests mock external HTTP, auth and database
adapters. Browser verification mocks provider/job HTTP while importing a real
GLB and rendering/editing genuine Three.js geometry. Live authenticated Meshy/
Tripo generations and cloud save/reopen must be tested after actual keys,
credits and database access are configured. No live paid generation is claimed.

Run `npm test`, `npm run typecheck`, and focused lint. Start Next on port 3003
and run `node scripts/verify-ai3d-studios.mjs` for the isolated Chrome workflow.

Protocol references:
[Meshy text-to-3D](https://docs.meshy.ai/en/api/text-to-3d),
[Tripo v3 text-to-model](https://developers.tripo3d.ai/en/docs/generation-text-to-model),
[Tripo task query](https://developers.tripo3d.ai/en/docs/task-query).
