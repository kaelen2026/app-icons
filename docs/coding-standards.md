# Coding Standards

These standards keep the icon studio small enough to reason about as new export
targets and editing workflows are added.

## State

- `IconConfig` is the single source of design state.
- Panels receive `config` plus an `onChange(patch)` callback.
- Panels must not keep duplicate copies of `IconConfig` fields in local state.
- New `IconConfig` fields must update:
  - `src/types/icon.ts`
  - config parsing and defaults
  - persistence/import tests
  - any affected panels and renderer branches

## React Boundaries

- React components compose UI and wire events.
- Shared business logic should live in hooks or `src/lib`.
- Hooks may coordinate browser state, persistence, import/export flow, and
  progress state.
- Renderer modules must not import React.
- Export registry modules must not import React.

## Rendering

- Canvas rendering is owned by `src/lib/renderIcon.ts` and its helper modules.
- Export variants are data first: add or change a `RenderVariant` before adding
  renderer branches.
- Platform safe-zone logic belongs to render variants, not UI components.
- Browser-only canvas APIs must stay behind client-only paths.

## Export Platforms

- Platform support is registry-driven through `src/lib/exportPresets.ts`.
- Export panel file lists, ZIP entries, README sections, and platform metadata
  should derive from the registry.
- Adding a platform should not require changing `ExportPanel` except for new UI
  affordances that are not representable in the registry.

## Tests

- Unit tests cover pure logic and parser/registry behavior.
- Component tests cover user-visible interaction and state wiring.
- E2E tests cover routing, canvas smoke checks, export/download flow, and mobile
  ergonomics.
- Refactors that introduce hooks or helpers should add direct tests for the new
  unit boundary before moving behavior.

## Type Safety

- Avoid `any`; prefer `unknown` at trust boundaries and validate before use.
- Prefer explicit exported types for public module contracts.
- Treat localStorage, imported JSON, and user files as untrusted input.
- Do not silence TypeScript or lint rules without a narrow comment explaining
  why the exception is safe.
