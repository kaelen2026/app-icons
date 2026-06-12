# ADR 0004: Exported Config Snapshot

## Status

Accepted

## Context

The exported ZIP includes an `icon-config.json` so a design can be restored
later. Uploaded image data URLs can be very large and may contain private asset
data.

## Decision

Export the design configuration without `imageSrc`. Include `hasImage` to tell
the importer that the design originally used an uploaded image.

## Consequences

- ZIP metadata stays small.
- Private uploaded image bytes are not duplicated into config metadata.
- Image-mode imports may require users to re-upload the source image.
- The importer must surface a clear note when image data is missing.
