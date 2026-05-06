# Alternus Platform Backend

## Architecture

The platform backend uses the existing Next.js App Router route-handler architecture with Prisma/PostgreSQL and NextAuth.

Shared backend code lives in `src/lib/platform`:

- `api.ts`: authenticated workspace context, JSON errors, activity logs, notifications.
- `validation.ts`: request body/query validation and safe path checks.
- `storage.ts`: local development asset storage with extension/MIME validation.
- `stub-provider.ts`: local stub jobs for AI/CAD/Blender/code/prompt flows.
- `help-content.ts`: seeded Help Center articles.

All workspace APIs require a signed-in session. The first request auto-creates a personal workspace, owner membership, subscription state, and settings for the current user.

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection used by Prisma.
- `DIRECT_URL`: direct PostgreSQL connection for Prisma.
- `ASSET_STORAGE_PROVIDER`: currently supports `local`.
- `ASSET_UPLOAD_DIR`: local upload directory, default `./storage/assets`.
- `MAX_ASSET_UPLOAD_MB`: upload limit in MB, default `25`.

## API Surface

Shared:

- `GET /api/me`
- `GET /api/workspace`
- `PATCH /api/workspace`
- `GET /api/subscription`
- `POST /api/subscription/upgrade-intent`
- `GET /api/settings`
- `PATCH /api/settings/user`
- `PATCH /api/settings/workspace`
- `GET /api/studio/overview`
- `GET /api/activity`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs/:id/cancel`

Assistant:

- `GET|POST /api/assistant/conversations`
- `GET|PATCH|DELETE /api/assistant/conversations/:id`
- `POST /api/assistant/conversations/:id/messages`

Design:

- `GET|POST /api/prototypes`
- `GET|PATCH|DELETE /api/prototypes/:id`
- `POST /api/prototypes/:id/duplicate`
- `POST /api/prototypes/:id/open`
- `GET|POST /api/design-systems`
- `GET|PATCH|DELETE /api/design-systems/:id`

Assets:

- `GET|POST|PATCH|DELETE /api/assets`
- `GET|PATCH|DELETE /api/assets/:id`
- `GET /api/assets/:id/download`
- `GET /api/assets/:id/preview`
- `POST /api/assets/:id/duplicate` returns an honest unsupported response for local binary copy.

AutoCAD, Blender, Code, Prompt Lab, Exports, Help:

- AutoCAD designs/jobs under `/api/autocad/*`
- Blender projects/jobs under `/api/blender/*`
- Code projects/files/jobs under `/api/code/*`
- Prompts/runs under `/api/prompts` and `/api/prompt-runs`
- Exports under `/api/exports`
- Help articles/search under `/api/help/*`
- Notification helpers under `/api/notifications/:id/read`, `/api/notifications/read-all`, and `/api/notifications/:id`

## Storage Behavior

Local storage writes files outside source code by default at `storage/assets/{workspaceId}/{year}/{uuid}.{ext}`.

The backend rejects path traversal, unsafe server-side/executable extensions, unsupported asset types, and files over the configured limit. Preview is inline only for safe MIME types such as images, text, audio, SVG, and PDF.

## Stub Provider Behavior

No real AI, AutoCAD, Blender, code execution, or payment provider is called. Stub endpoints persist records and jobs with explicit `local_stub` output messages so the UI can display honest status while provider integrations are deferred.

## Frontend Consumption

List endpoints support `search`, `type`, `status`, `projectId`, `sort`, and `limit` where relevant. Dates are ISO strings from Prisma serialization. Asset records include stable `previewUrl` and `downloadUrl` values.

## Limitations

- No real payment checkout is configured.
- No external AI/CAD/Blender/rendering provider is invoked.
- Local asset duplication is not enabled because it must copy binary files safely.
- Existing frontend screens still need follow-up wiring from local UI state to these APIs.
