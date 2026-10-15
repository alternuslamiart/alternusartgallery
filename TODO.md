# Next tasks (reviewed 2026-10-15)

## Next concrete task

- [ ] Apply `20261015000000_ai_chat_history` to a configured PostgreSQL database
  and run the new persistence integration test plus authenticated end-to-end
  checks for account isolation, message retry, refresh recovery, and Recent.
- [ ] Verify the compact floating Infrastructure Studio layout in a browser at
  desktop and mobile widths, including camera toolbar placement and panel
  toggles.
- [ ] Design authenticated infrastructure-scene persistence within an
  existing workspace/project API. Inspect Prisma project/asset models and
  ownership checks first; decide whether the scene belongs in a project
  snapshot or dedicated schema before implementation. Add a migration and
  authenticated API tests only after that decision.

## Blockers

- Gemini direct responses require billing to be enabled on the Google AI
  project: the configured key's API reports that the free tier is unavailable
  in this country. Groq is working and serves as the automatic fallback.
- Browser automation/WebGL verification is not configured in the current test
  tooling. Use a browser-capable environment before claiming camera or
  responsive interaction verification.
- This environment has no `DATABASE_URL`, so AI chat migration application,
  authenticated API integration, and the PostgreSQL persistence test are
  blocked until a database is configured.
- Workspace persistence needs an explicit project association and database
  representation; browser-local autosave is not a substitute.
