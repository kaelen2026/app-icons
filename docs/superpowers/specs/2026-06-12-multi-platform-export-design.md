# Multi-Platform Icon Export — Design

**Date:** 2026-06-12
**Status:** Approved

## Goal

Extend the app icon generator's single fixed export pack (Expo + Web/PWA) into
five user-selectable platform packs: **iOS, Android, Web, WebApp (PWA), Expo**.
Each pack contains correctly rendered assets and the platform's metadata files,
ready to drop into a project.

## Decisions (confirmed with user)

1. **Platform selection:** checkboxes in the export panel, one ZIP containing
   only the selected platforms' directories. All five checked by default.
2. **iOS:** Xcode 14+ single-size format — `AppIcon.appiconset/` with one
   1024×1024 PNG and a `Contents.json` (universal, single-size). No legacy
   size matrix.
3. **Android:** Adaptive + Legacy — per-density legacy `ic_launcher.png`,
   adaptive foreground/background layers, `ic_launcher.xml`, and a Play Store
   512px icon.
4. **Expo:** kept as a fifth platform. One correctness fix: `adaptive-icon.png`
   is rendered as an adaptive **foreground layer** (transparent background,
   safe-zone scaled) instead of the full masked icon, because Expo passes it to
   Android as `adaptiveIcon.foregroundImage`.
5. **Architecture:** Approach A — a declarative platform registry drives
   rendering, static files, README content, and the UI.

## Architecture

### 1. Platform registry — `src/lib/exportPresets.ts`

```ts
export type RenderVariant =
  | "masked"             // current behavior: shape clip + background + foreground
  | "fullBleed"          // square, no clip: background + foreground
  | "adaptiveForeground" // transparent background, foreground scaled into 66/108 safe zone
  | "adaptiveBackground" // background only, full bleed
  | "maskable";          // full bleed, foreground scaled into 80% safe zone

export type PlatformFile = { path: string; size: number; variant: RenderVariant };

export type PlatformId = "ios" | "android" | "web" | "webapp" | "expo";

export type Platform = {
  id: PlatformId;
  label: string;
  description: string;                                       // short UI hint
  files: PlatformFile[];
  staticFiles?: (config: IconConfig) => Record<string, string>; // path → text content
  readmeSection: (config: IconConfig) => string;
};

export const platforms: Platform[]; // the five entries below
```

`path` values are ZIP-relative and include the platform directory prefix
(e.g. `ios/AppIcon.appiconset/icon-1024.png`).

### 2. Platform contents

**ios/**
- `AppIcon.appiconset/icon-1024.png` — 1024, `fullBleed` (iOS masks icons
  itself; pre-rounded corners would double-mask)
- `AppIcon.appiconset/Contents.json` — static; single-size universal entry
  (`"platform": "ios", "size": "1024x1024"`) + standard `info` block

**android/**
- Legacy launcher, variant `masked` (user's chosen shape, transparency outside):
  `res/mipmap-mdpi/ic_launcher.png` 48, `-hdpi` 72, `-xhdpi` 96,
  `-xxhdpi` 144, `-xxxhdpi` 192
- Adaptive foreground, variant `adaptiveForeground`:
  `res/mipmap-{m,h,x,xx,xxx}hdpi/ic_launcher_foreground.png`
  at 108 / 162 / 216 / 324 / 432
- Adaptive background, variant `adaptiveBackground`: same densities/sizes,
  `ic_launcher_background.png`
- `res/mipmap-anydpi-v26/ic_launcher.xml` — static; `<adaptive-icon>`
  referencing `@mipmap/ic_launcher_foreground` / `@mipmap/ic_launcher_background`
- `play-store-icon.png` — 512, `fullBleed` (Play Console rejects transparency)

**web/**
- `favicon-16x16.png` — 16, `masked`
- `favicon-32x32.png` — 32, `masked`
- `apple-touch-icon.png` — 180, `fullBleed`

**webapp/**
- `icon-192.png`, `icon-512.png` — `masked`
- `maskable-icon-192.png`, `maskable-icon-512.png` — `maskable`
- `manifest.webmanifest` — static; `name`/`short_name` from `config.appName`,
  four icon entries with `purpose: "any"` / `purpose: "maskable"`

**expo/**
- `icon.png` — 1024, `masked`
- `adaptive-icon.png` — 1024, `adaptiveForeground` (the correctness fix)
- `splash-icon.png` — 1024, `masked`

Root of ZIP (always included): `README.md` (assembled from selected platforms'
`readmeSection`s) and `icon-config.json` (config snapshot minus `imageSrc`,
plus `platforms: PlatformId[]` exported).

### 3. Render variants — `src/lib/renderIcon.ts`

`drawIcon`, `renderIcon`, and `renderIconDataUrl` gain a trailing
`variant: RenderVariant = "masked"` parameter, so the live preview and any
existing caller compile unchanged.

Variant behavior inside `drawIcon`:

| variant            | shape clip | background | foreground scale multiplier |
|--------------------|-----------|------------|------------------------------|
| masked             | yes       | yes        | 1.0                          |
| fullBleed          | no        | yes        | 1.0                          |
| adaptiveForeground | no        | no         | 66 / 108 (≈0.611)            |
| adaptiveBackground | no        | yes        | n/a (foreground skipped)     |
| maskable           | no        | yes        | 0.8                          |

The multiplier applies to the effective `config.scale` used by both image and
text foregrounds, keeping the user's relative sizing intact within the safe
zone.

### 4. Export flow — `src/lib/exportZip.ts`

```ts
export async function exportZip(
  config: IconConfig,
  selected: PlatformId[],
  onProgress?: (path: string) => void
): Promise<Blob>
```

- Iterate `platforms` filtered by `selected`; for each `PlatformFile`, call
  `renderIcon(config, size, variant)` sequentially (preserving the existing
  per-file progress behavior) and add to the zip at `path`.
- Add each platform's `staticFiles` entries.
- Build `README.md` from the selected platforms' `readmeSection`s under a
  shared header.
- Write `icon-config.json` as today, plus the `platforms` array.

Error handling unchanged from MVP: a failed foreground image load degrades to
background-only (existing `renderIcon` behavior); a failed PNG encode rejects
and surfaces through the existing export error state in `page.tsx`.

### 5. UI — `src/components/ExportPanel.tsx`

- Checkbox row per platform: label, short description, file count
  (`files.length + staticFiles count`). All checked by default; state is a
  `Set<PlatformId>` local to the panel.
- `onDownload(selected: PlatformId[])` — `page.tsx` threads the selection into
  `exportZip`.
- Download button disabled while exporting **or when no platform is selected**.
- The expandable file list groups paths under platform headings and only shows
  selected platforms; total count updates accordingly.

### 6. Verification

- `npm run typecheck` and `npm run lint` pass.
- Manual QA on the dev server: export with all platforms selected, unzip,
  verify directory structure, that `Contents.json` / `ic_launcher.xml` /
  `manifest.webmanifest` parse, that adaptive foreground PNGs have transparent
  corners, and that a subset selection (e.g. iOS only) produces only `ios/` +
  README + config.
- No test framework exists in the repo; none is added in this scope.

## Out of scope

- `favicon.ico` (multi-resolution ICO encoding in-browser)
- Android monochrome/themed icon layer (Android 13+)
- Legacy iOS size matrix
- Per-platform background overrides (adaptive background uses the same
  background config)
