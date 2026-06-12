# ADR 0003: Canvas Renderer and React Boundary

## Status

Accepted

## Context

The same icon composition is rendered for live previews, context previews, and
offscreen export files.

## Decision

Keep Canvas rendering in `src/lib` and keep React components as callers. The
renderer accepts `IconConfig`, size, and `RenderVariant`; it does not know about
component state or UI events.

## Consequences

- Live preview and export share the same rendering path.
- Renderer behavior can be tested without component fixtures.
- Browser-only APIs stay isolated from server-rendered app files.
- React components remain responsible for scheduling and user feedback.
