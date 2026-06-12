# Engineering Quality Gates

This project keeps local quality checks runnable before code is hosted.

## Core Gate

```sh
pnpm quality
```

This runs:

- `pnpm test:coverage`: unit and component coverage thresholds.
- `pnpm lint`: repository hygiene, design lint, Markdown lint, secret scanning,
  ESLint, and Biome.
- `pnpm lint:dead-code`: unused files, exports, and dependencies via Knip.
- `pnpm typecheck`: TypeScript compiler checks.
- `pnpm build`: production Next build.

TypeScript is intentionally strict: `strict`, `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `noImplicitOverride`, and `allowJs: false` are
enabled in `tsconfig.json`.

## Focused Checks

```sh
pnpm lint:repo       # local file hygiene, conflict markers, debug logs
pnpm lint:design     # design-system constraints
pnpm lint:md         # Markdown docs style
pnpm lint:secrets    # secret scanning
pnpm lint:dead-code  # unused files, exports, dependencies
pnpm audit:deps      # dependency vulnerabilities
pnpm deps:outdated   # available dependency updates
```

`pnpm audit:deps` is intentionally separate from `pnpm quality` because
registry advisories can change independently from source changes. Run it before
release and when updating dependencies.

## Architecture Checks

Use [docs/coding-standards.md](coding-standards.md) when changing app structure.
Record durable architectural decisions in [docs/adr](adr). New shared behavior
should move into tested hooks or `src/lib` modules instead of accumulating in
large UI components.
