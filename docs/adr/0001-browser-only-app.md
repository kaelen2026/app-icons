# ADR 0001: Browser-Only App

## Status

Accepted

## Context

The app generates icons from user-provided designs and uploaded images. These
inputs may be private or unreleased.

## Decision

Keep the product browser-only. Rendering, persistence, import, export, and ZIP
generation all happen client-side.

## Consequences

- No server routes, auth, database, or upload path are required.
- User images stay on the user's machine.
- Browser storage and Canvas limits are product constraints.
- Heavy export work must be optimized in client code rather than offloaded to a
  backend.
