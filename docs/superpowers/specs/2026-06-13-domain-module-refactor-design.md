# Domain Module Refactor — Design

**Date:** 2026-06-13
**Status:** Approved

## Goal

Refactor the project toward domain modules so related UI, hooks, pure logic,
types, and tests sit closer together while preserving current behavior. The
first implementation phase should be a low-risk pilot around the export domain.

This is an architecture refactor, not a feature change.

## Current Problem

The codebase is organized mostly by technical layer:

- `src/components/` contains all UI components and hooks.
- `src/lib/` contains rendering, export, storage, presets, readiness, site data,
  and other pure logic.
- `src/types/` contains shared domain state.

That structure is workable, but as export targets, saved designs, variations,
readiness checks, and rendering variants grow, related files are spread across
multiple top-level folders. This increases the cost of understanding ownership
and makes broad edits more likely.

## Chosen Approach

Use **Domain Modules, migrated gradually**.

Each domain gets a folder under `src/modules/<domain>/` with focused
subfolders:

```text
src/modules/
  exporting/
    components/
    hooks/
    lib/
    __tests__/
    index.ts
  rendering/
    lib/
    __tests__/
    index.ts
  icon-config/
    lib/
    types/
    __tests__/
    index.ts
  design-library/
    components/
    hooks/
    lib/
    __tests__/
    index.ts
```

The first phase migrates only the export domain. Later phases can migrate
rendering, icon config/storage, saved designs, and variations.

## Module Boundaries

### `src/modules/exporting`

Owns export-facing behavior:

- `ExportPanel`
- `useIconExport`
- `exportPresets`
- `exportZip`
- `ico`
- `readiness`
- related tests

The module may depend on:

- `@/types/icon`
- rendering APIs from the current `src/lib/renderIcon` path during the pilot
- browser-safe helpers

It must not depend on unrelated UI panels, saved designs, variations, or app
routes.

### `src/modules/rendering`

Future module for Canvas rendering:

- `renderIcon`
- `renderVariants`
- `renderCanvas`
- `drawBackground`
- `drawShape`
- `lucide`

This module must stay React-free.

### `src/modules/icon-config`

Future module for configuration state and trust-boundary parsing:

- `IconConfig` types
- defaults
- schema/parser
- config storage
- import/export config snapshot helpers

### `src/modules/design-library`

Future module for user design workflows:

- saved designs
- variations
- presets
- related panels/hooks

## Compatibility Strategy

Use a compatibility layer during migration:

1. Move files into their module.
2. Leave thin re-export shims at the old paths.
3. Update internal imports for touched files to prefer module paths.
4. Remove old-path shims only after all imports have migrated in a later phase.

Example:

```ts
// src/lib/exportZip.ts
export { exportZip } from "@/modules/exporting/lib/exportZip";
```

This keeps the first phase behavior-preserving and avoids forcing every import
to change in one commit.

## First Phase: Exporting Pilot

Create `src/modules/exporting/` and move:

```text
src/components/ExportPanel.tsx
src/components/ExportPanel.test.tsx
src/components/useIconExport.ts
src/components/useIconExport.test.tsx
src/lib/exportPresets.ts
src/lib/exportPresets.test.ts
src/lib/exportZip.ts
src/lib/exportZip.test.ts
src/lib/ico.ts
src/lib/ico.test.ts
src/lib/readiness.ts
src/lib/readiness.test.ts
```

Target layout:

```text
src/modules/exporting/
  components/ExportPanel.tsx
  hooks/useIconExport.ts
  lib/exportPresets.ts
  lib/exportZip.ts
  lib/ico.ts
  lib/readiness.ts
  __tests__/ExportPanel.test.tsx
  __tests__/useIconExport.test.tsx
  __tests__/exportPresets.test.ts
  __tests__/exportZip.test.ts
  __tests__/ico.test.ts
  __tests__/readiness.test.ts
  index.ts
```

Leave old path shims for all moved files.

Update direct app imports where practical:

- `IconStudio` should import `ExportPanel`, `useIconExport`,
  `allPlatformIds`, `PlatformId`, and `getReadinessReport` from
  `@/modules/exporting`.
- Existing tests outside the exporting module may continue using old shims until
  their owning modules move.

## Import Direction Rules

- App routes and top-level studio components may import modules.
- Modules may import shared types and lower-level utility modules.
- Modules must not import from app routes.
- Modules must not import from another module's private subpaths unless that
  module explicitly exports the API from `index.ts`.
- React components and hooks stay out of `lib/` subfolders.
- `lib/` subfolders must not import React.

## Testing

The first phase is behavior-preserving. Required checks:

```sh
pnpm test
pnpm lint
pnpm lint:dead-code
pnpm typecheck
pnpm build
```

Run `pnpm test:e2e` if import movement touches live export flow wiring beyond
path changes.

## Risks And Mitigations

- **Risk:** duplicate old/new imports cause drift.
  - **Mitigation:** old paths are re-export shims only; implementation lives in
    one module path.
- **Risk:** test discovery changes miss moved tests.
  - **Mitigation:** keep filenames ending in `.test.ts` / `.test.tsx` and run
    `pnpm test`.
- **Risk:** circular dependencies appear when module index exports too much.
  - **Mitigation:** keep `index.ts` limited to public APIs used outside the
    module.
- **Risk:** large move hides behavior changes.
  - **Mitigation:** first phase should avoid logic edits. Any required logic fix
    should be separate from file movement.

## Out of Scope

- Changing app behavior.
- Redesigning UI.
- Moving every file in one pass.
- Removing old import shims in the first phase.
- Introducing new dependencies or path aliases.
- Changing `IconConfig` shape.
- Changing renderer behavior or export ZIP contents.
