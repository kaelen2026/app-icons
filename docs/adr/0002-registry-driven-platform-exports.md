# ADR 0002: Registry-Driven Platform Exports

## Status

Accepted

## Context

Each platform needs a different set of PNGs, ICO bundles, static metadata, and
installation instructions.

## Decision

Represent platform output with the registry in `src/lib/exportPresets.ts`.
Export UI, ZIP generation, README content, and file-list previews derive from
that registry.

## Consequences

- Adding an export target is mostly declarative.
- UI and ZIP contents stay in sync.
- Platform-specific rendering differences are expressed as render variants.
- The registry can grow large and should be kept data-focused.
