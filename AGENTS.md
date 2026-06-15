<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```sh
pnpm dev             # dev server at localhost:3000
pnpm lint            # repo hygiene + design + Markdown + secrets + ESLint + Biome
pnpm audit:deps      # dependency vulnerability audit
pnpm quality         # coverage + lint + dead-code + typecheck + build
pnpm typecheck       # tsc --noEmit
pnpm build           # next build
```

See `docs/quality.md` for the full verification command list.

## Required Reading

Before making code or documentation changes, read `docs/gitflow.md`. Do not
work directly on `main` or `dev`; both are protected and reject direct pushes
(including from admins).

The PR flow is enforced by branch protection and the `Branch Policy` CI check:

- Create a short-lived `feature/*`, `fix/*`, `docs/*`, or `chore/*` branch and
  open a pull request against `dev`.
- `main` is updated only by a `dev` -> `main` promotion pull request; any other
  branch targeting `main` is rejected.
- `Verify`, `Coverage`, and `Branch Policy` must pass before any merge. No
  review approval is required, so you may merge your own PR once checks are
  green; prefer a rebase merge.

Before multi-step implementation or structural refactors, read
`docs/agent-workflow.md`. The main agent coordinates the flow, coding subagents
handle scoped implementation tasks, and separate review subagents review the
result. Do not use the same subagent as both coder and sole reviewer for the same
task.

## Project Rules

Before changing UI, read `docs/design-system.md`. The app uses a dense
terminal-studio design language: dark tokenized surfaces, hairline borders,
compact mono typography, restrained radii, and direct tool controls. New UI must
use the existing tokens in `src/app/globals.css`, preserve mobile ergonomics,
avoid decorative marketing patterns, and add/update interaction tests when
component behavior changes.

Before structural refactors, read `docs/coding-standards.md` and relevant ADRs
in `docs/adr/`. Keep `IconConfig` as the single source of design state, keep
Canvas rendering outside React, and prefer tested hooks or `src/lib` modules for
shared behavior. TypeScript is intentionally strict; do not loosen `tsconfig`
without documenting the tradeoff.

Before architecture-sensitive changes, read `docs/architecture.md`.

## Boundaries

Everything runs client-side in the browser. Do not add server routes, API handlers, databases, or auth.
