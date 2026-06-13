# Saved Designs Module Refactor Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

## Goal

Move saved-design persistence, hook state, and panel UI into an owned
`src/modules/saved-designs` module while keeping legacy import paths as shims.

## Constraints

- Preserve `IconConfig` as the single source of design state.
- Keep localStorage parsing at the trust boundary and covered by tests.
- Do not change saved-design behavior or storage key.
- Keep old `src/components/*` and `src/lib/*` import paths working through
  compatibility shims.
- Coding and review responsibilities must stay separate.

## Tasks

- [x] Create `src/modules/saved-designs` with:
  - `components/SavedDesignsPanel.tsx`
  - `hooks/useSavedDesigns.ts`
  - `lib/savedDesigns.ts`
  - `__tests__/` covering the moved component, hook, and storage logic
  - `index.ts` as the public module API
- [x] Replace old implementation files with shims:
  - `src/components/SavedDesignsPanel.tsx`
  - `src/components/useSavedDesigns.ts`
  - `src/lib/savedDesigns.ts`
- [x] Update `IconStudio` and tests to consume `@/modules/saved-designs`.
- [x] Update coverage/dead-code configuration if needed so moved files and shims
  remain visible to quality gates.
- [x] Run focused tests for saved designs and studio integration.
- [x] Run broad verification: `pnpm test`, `pnpm lint:dead-code`,
  `pnpm typecheck`, and `pnpm build`.
- [x] Have a separate review agent inspect the migration before completion.
