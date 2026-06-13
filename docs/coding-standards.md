# Coding Standards

These standards keep the icon studio small enough to reason about as new export
targets and editing workflows are added.

## Workflow

- Before making code or documentation changes, read `docs/gitflow.md`.
- Do not work directly on `main`; use a short-lived branch such as
  `feature/<name>`, `fix/<name>`, `docs/<name>`, or `chore/<name>`.
- Pull requests target `dev`; `main` is for release-ready code.
- Commit messages must follow Conventional Commits because the commit hook
  enforces commitlint.
- Keep changes scoped to the requested behavior. Do not combine unrelated
  refactors, dependency updates, formatting sweeps, or metadata churn with a
  feature/fix unless they are required to complete it safely.

## State

- `IconConfig` is the single source of design state.
- Panels receive `config` plus an `onChange(patch)` callback.
- Panels must not keep duplicate copies of `IconConfig` fields in local state.
- New `IconConfig` fields must update:
  - `src/types/icon.ts`
  - config parsing and defaults
  - persistence/import tests
  - any affected panels and renderer branches

## File Boundaries

- React components render UI, wire events, and call hooks or `src/lib` helpers.
- Hooks coordinate browser state, persistence, imports, exports, async progress,
  and user-visible status.
- `src/lib` modules hold pure business logic, Canvas helpers, platform
  registries, parsers, encoders, and browser-safe utilities.
- Renderer modules own Canvas drawing and must stay outside React.
- Export registry modules are declarative data plus text/static-file builders;
  they must not import React or component code.
- Storage/schema modules own trust-boundary parsing for persisted and imported
  data.
- Keep file ownership narrow. If a change requires touching many boundaries,
  add a small tested helper at the boundary instead of duplicating logic in UI.

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
- Live preview rendering and export rendering must share renderer code. Do not
  create a second renderer for a special UI state.
- Failed image loads or unsupported user inputs should degrade through explicit
  renderer behavior or surface through the caller's error state; do not hide
  unexpected failures with broad catch blocks.

## Export Platforms

- Platform support is registry-driven through `src/lib/exportPresets.ts`.
- Export panel file lists, ZIP entries, README sections, and platform metadata
  should derive from the registry.
- Adding a platform should not require changing `ExportPanel` except for new UI
  affordances that are not representable in the registry.
- Platform-specific file paths, sizes, static metadata, and README text belong
  in the registry.
- Multi-resolution image bundles belong in focused encoder modules such as
  `src/lib/ico.ts`, not in components.
- New platform requirements should usually be represented as a new render
  variant or registry entry before adding renderer conditionals.

## Imports And Modules

- Use the `@/` alias for app imports.
- Avoid circular dependencies. If a cycle appears, move shared types or helpers
  into a smaller neutral module.
- Prefer explicit exported types for module boundaries that are consumed outside
  the file.
- Keep browser-only APIs out of modules that may be imported during build-time
  metadata generation unless the caller is already client-only.
- Do not add broad utility files for one caller. Start local, then extract when
  a second real caller appears or the boundary improves testability.

## Data Validation

- Treat localStorage, imported JSON, user files, data URLs, and user-entered
  text as untrusted input.
- Parse untrusted structured data through the existing schema/parser modules
  before merging it into `IconConfig`.
- Keep defaults and sanitizers aligned. A new config field requires a default,
  parser support, and persistence/import tests.
- Do not trust file extensions alone. Validate file type, parseability, and
  failure behavior at the upload/import boundary.

## Error Handling

- Pure logic should return structured results or throw narrow, documented
  errors. UI-facing hooks/components translate those results into visible
  status.
- User-triggered import/export failures need clear user-visible messages and
  tests for the failure path when practical.
- Do not swallow errors silently. If an error is intentionally ignored, leave a
  narrow comment explaining why the fallback is safe.
- Avoid catch-all recovery inside shared logic when the caller can present a
  better error or retry path.

## Tests

- Unit tests cover pure logic and parser/registry behavior.
- Component tests cover user-visible interaction and state wiring.
- E2E tests cover routing, canvas smoke checks, export/download flow, and mobile
  ergonomics.
- Refactors that introduce hooks or helpers should add direct tests for the new
  unit boundary before moving behavior.
- New `IconConfig` fields require parser/default/persistence tests plus affected
  component or renderer tests.
- New export platforms require registry tests and ZIP/file-list coverage.
- New render variants require renderer/variant tests that prove the declared
  behavior.
- UI behavior tests should query by role, label, name, or visible text rather
  than implementation details.
- Scripts should expose small pure helpers for unit tests and keep real side
  effects out of tests.

## Type Safety

- Avoid `any`; prefer `unknown` at trust boundaries and validate before use.
- Prefer explicit exported types for public module contracts.
- Treat localStorage, imported JSON, and user files as untrusted input.
- Do not silence TypeScript or lint rules without a narrow comment explaining
  why the exception is safe.
- Use `readonly` inputs when a helper should not mutate caller-owned arrays or
  objects.
- Preserve strictness. Do not loosen `tsconfig`, lint rules, or schema
  validation to make a local change easier.

## Scripts And Tooling

- Repository scripts should use Node built-ins first and avoid adding runtime
  dependencies for small automation.
- Scripts with logic should export pure helpers and test those helpers without
  performing irreversible side effects such as tagging, pushing, deleting, or
  deploying.
- Release and dependency-update work must run the documented gates before
  publishing or tagging.
- Do not commit generated output such as `.next/`, coverage reports,
  Playwright reports, or temporary brainstorm artifacts.

## Documentation Updates

- Update `AGENTS.md` when agent-facing workflow, verification, or architecture
  rules change.
- Update `docs/design-system.md` when UI constraints or tokens change.
- Add or update ADRs in `docs/adr/` for durable architecture decisions that
  affect future implementation choices.
- Keep `docs/superpowers/specs/` and `docs/superpowers/plans/` aligned with
  approved feature designs and implementation plans.
