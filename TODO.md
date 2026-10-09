# Next tasks

## Next concrete task

- [ ] Verify the compact floating Infrastructure Studio layout in a browser at
  desktop and mobile widths, including camera toolbar placement and panel
  toggles.
- [ ] Design authenticated infrastructure-scene persistence within an
  existing workspace/project API. Inspect Prisma project/asset models and
  ownership checks first; decide whether the scene belongs in a project
  snapshot or dedicated schema before implementation. Add a migration and
  authenticated API tests only after that decision.

## Blockers

- Production build and full-project typecheck currently exceed available Node
  heap during compilation in this environment. Retry when a larger-memory
  runner is available.
- Browser automation/WebGL verification is not configured in the current test
  tooling. Use a browser-capable environment before claiming camera or
  responsive interaction verification.
- Workspace persistence needs an explicit project association and database
  representation; browser-local autosave is not a substitute.
