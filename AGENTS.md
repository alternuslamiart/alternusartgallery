# Repository work instructions

Before starting a repository task, read `AGENTS.md`, `docs/ROADMAP.md`,
`docs/PROGRESS.md`, `docs/ARCHITECTURE.md`, and `TODO.md`. These files establish
the current priorities, verified state, and next task; update them when the work
changes those facts. If one is missing, inspect the existing source and docs
first, then bootstrap the missing documentation without inventing completed
work.

## Working loop

1. Inspect the relevant implementation and tests; choose the highest-priority
   unfinished task that can be completed safely in the current scope.
2. Write or update a focused test before changing behavior where practical.
3. Implement one small, complete increment in the existing application.
4. Run focused tests, lint, type checks, and the build when resources permit.
   Fix regressions introduced by the change. Record commands that could not
   complete and their exact blocker; never report them as passing.
5. Update `docs/PROGRESS.md` with verified outcomes and `TODO.md` with the next
   concrete task and known blockers. Keep `docs/ROADMAP.md` and
   `docs/ARCHITECTURE.md` aligned with material changes.
6. Continue with a distinct, independent task only when its scope and available
   execution budget permit; do not repeat planning instead of delivering work.

## Safety and repository conventions

- Preserve existing routes, authentication, working features, and unrelated
  user changes. Do not discard dirty files or perform destructive Git actions
  without explicit approval.
- Keep credentials and private environment values out of source and docs.
- Follow existing Next.js App Router, TypeScript, Prisma, and error-handling
  patterns. Keep server integrations on the server and scope workspace data to
  the authenticated workspace.
- Treat stub integrations honestly; do not imply that a local demo calls a real
  AI, CAD, rendering, or payment provider.
- Prefer focused tests and checks. If build or type checking is blocked by
  missing credentials, resource limits, permissions, or unavailable services,
  preserve the failure details and the next action needed.
- Do not claim runtime or browser verification unless it was actually performed.
