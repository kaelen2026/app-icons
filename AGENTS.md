<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```sh
pnpm dev             # dev server at localhost:3000
pnpm lint            # repo hygiene + design + Markdown + secrets + ESLint + Biome
pnpm lint:dead-code  # Knip unused files/exports/dependencies check
pnpm audit:deps      # dependency vulnerability audit
pnpm quality         # coverage + lint + dead-code + typecheck + build
pnpm format          # biome check --write . (format + safe lint fixes)
pnpm typecheck       # tsc --noEmit
pnpm build           # next build
```

## Verification

The baseline verification gate after code changes is:

```sh
pnpm test && pnpm lint && pnpm typecheck && pnpm build
```

The full local quality gate is:

```sh
pnpm quality
```

Run `pnpm audit:deps` before release and dependency updates. For UI or
export-flow changes, also run `pnpm test:e2e`. For production smoke testing
after `pnpm build`, run `pnpm test:e2e:prod`.

Git hooks (husky) enforce this on commit: pre-commit runs lint-staged (Biome + ESLint on staged files), commit-msg runs commitlint — commit messages must follow Conventional Commits (`feat: ...`, `fix: ...`, etc.). Formatting is Biome (2-space indent, double quotes), configured in `biome.json`.

## Project architecture

Browser-only app icon generator: compose a foreground (image upload, text, or Lucide icon) over a background and shape, preview live, export a multi-platform ZIP. No backend, no database — everything renders client-side with the Canvas API.

The whole app derives from one state object:

- **`IconConfig`** (`src/types/icon.ts`) — the single source of design state. `src/components/IconStudio.tsx` owns it in a `useState` and hands every panel an `update(patch)` callback; panels never hold their own copies. `src/app/page.tsx` is only an `ssr: false` dynamic wrapper, so the studio can read its persisted state in the initializer. Persistence lives in `src/lib/configStorage.ts` (debounced localStorage autosave + the sanitizer used for `icon-config.json` import) — new `IconConfig` fields must be added to its parser too.
- **`drawIcon()`** (`src/lib/renderIcon.ts`) — the rendering core, shared by the live preview canvas and the offscreen export renderer. The key concept is **`RenderVariant`**: the same config renders differently per target (`masked` for previews, `fullBleed` for iOS/Play Store which apply their own mask, `adaptiveForeground`/`adaptiveBackground` for Android adaptive layers, `maskable` for PWA). Each variant declares clip/background/foreground flags plus an `fgScale` that shrinks the composition into that platform's safe zone. New platform requirements usually mean a new variant here, not a new renderer.
- **Platform registry** (`src/lib/exportPresets.ts`) — declarative list of platforms, each with rendered files (`{path, size, variant}`), optional multi-resolution `.ico` bundles (`icoFiles`, encoded by `src/lib/ico.ts`), optional static files (Contents.json, adaptive-icon XML, web manifest), and a README section. The export panel UI, the file-list preview, and the ZIP contents all derive from this registry — adding an export target means adding an entry here, nothing else.
- **`exportZip()`** (`src/lib/exportZip.ts`) — walks the registry for selected platforms, renders each file through `renderIcon`, and packages everything with JSZip plus a generated README and `icon-config.json` snapshot.
- **`src/lib/lucide.ts`** — turns Lucide icon nodes into recolored SVG data URLs that feed the image-drawing path in the renderer.

`docs/superpowers/specs/` holds design specs (e.g. the multi-platform export design).

## Design system

Before changing UI, read `docs/design-system.md`. The app uses a dense
terminal-studio design language: dark tokenized surfaces, hairline borders,
compact mono typography, restrained radii, and direct tool controls. New UI must
use the existing tokens in `src/app/globals.css`, preserve mobile ergonomics,
avoid decorative marketing patterns, and add/update interaction tests when
component behavior changes.

## Coding standards

Before structural refactors, read `docs/coding-standards.md` and relevant ADRs
in `docs/adr/`. Keep `IconConfig` as the single source of design state, keep
Canvas rendering outside React, and prefer tested hooks or `src/lib` modules for
shared behavior. TypeScript is intentionally strict; do not loosen `tsconfig`
without documenting the tradeoff.

## Boundaries

Everything runs client-side in the browser. Do not add server routes, API handlers, databases, or auth.
