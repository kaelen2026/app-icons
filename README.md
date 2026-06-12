# App Icons

Browser-only app icon generator for iOS, Android, HarmonyOS, web/PWA, Expo, and
desktop icon packs.

The app composes a foreground (image upload, text, emoji, or Lucide icon) over a
background and shape, previews the result live with Canvas, and exports a
multi-platform ZIP entirely in the browser. There is no backend, database, auth,
or upload path.

## Development

```sh
pnpm install
pnpm dev
```

Open [http://localhost:3000/favicon-generator](http://localhost:3000/favicon-generator).

## Quality Gates

Baseline local gate:

```sh
pnpm test && pnpm lint && pnpm typecheck && pnpm build
```

Full local quality gate:

```sh
pnpm quality
```

Additional gates:

```sh
pnpm test:coverage      # unit + component coverage thresholds
pnpm test:e2e           # browser smoke tests against dev server
pnpm build
pnpm test:e2e:prod      # browser smoke tests against production server
pnpm lint:dead-code     # unused files, exports, and dependencies
pnpm audit:deps         # dependency vulnerability audit
pnpm quality            # full local quality gate
```

`pnpm lint` runs repository hygiene checks, design constraints, Markdown lint,
secret scanning, ESLint, and Biome. GitHub Actions runs tests, design lint,
ESLint, Biome, typecheck, build, coverage, and production E2E on pull requests
and pushes to `main` once the repository is hosted.

## Architecture

- `src/types/icon.ts`: `IconConfig`, the single source of design state.
- `src/components/IconStudio.tsx`: owns config state, history, persistence,
  saved designs, import/export status, and panel composition.
- `src/lib/renderIcon.ts`: shared Canvas renderer for live preview and offscreen
  export rendering.
- `src/lib/exportPresets.ts`: declarative platform registry. Export panel file
  lists, ZIP contents, README sections, and platform metadata derive from it.
- `src/lib/exportZip.ts`: renders selected platform assets and packages the ZIP
  with JSZip.
- `src/lib/configStorage.ts`: localStorage persistence and imported
  `icon-config.json` sanitization.

## Testing

See [docs/testing.md](docs/testing.md).

Current layers:

- Unit: Vitest over pure logic in `src/lib`
- Component: Vitest + Testing Library + `happy-dom`
- E2E: Playwright desktop and mobile browser smoke tests
- Coverage: V8 provider with separate unit/component reports

## Engineering Practices

See [docs/coding-standards.md](docs/coding-standards.md) and
[docs/quality.md](docs/quality.md).

Architecture decisions are recorded in [docs/adr](docs/adr). Current guardrails:
browser-only execution, registry-driven platform exports, Canvas rendering
outside React, and compact config snapshots without uploaded image bytes.

## Design System

See [docs/design-system.md](docs/design-system.md).

Core UI constraints are enforced by `pnpm lint:design` and included in
`pnpm lint`. New UI should use semantic tokens from `src/app/globals.css`, keep
the dense terminal-studio style, preserve mobile ergonomics, and avoid
decorative marketing patterns.

## Deployment

Before production deploy:

```sh
pnpm audit:deps
pnpm quality
pnpm test:e2e:prod
```

The app is static/SSG-compatible and is currently deployed on Vercel.
