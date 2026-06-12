# Export Readiness Panel — Design

**Date:** 2026-06-13
**Status:** Approved

## Goal

Add an export readiness panel that tells users whether the currently selected
platform export is likely to be usable before they download the ZIP. The feature
should raise high-signal platform risks without blocking normal export
workflows, and it must stay fully client-side.

The panel lives inside the existing export area. It complements the platform
registry and renderer; it does not introduce a separate QA workspace or a new
rendering path.

## Decisions

1. **Placement:** inline inside `ExportPanel`, between platform selection and
   the download action.
2. **Behavior:** warnings are advisory and do not block export. Issues reflect
   existing impossible export states, such as no selected platforms.
3. **Scope:** first version uses deterministic checks derived from `IconConfig`,
   selected `PlatformId[]`, and `exportPresets`. It does not perform pixel-level
   image analysis.
4. **Architecture:** readiness logic is a pure `src/lib` module with React UI
   as a thin presentation layer.

## User Experience

`ExportPanel` shows a compact readiness section in the existing terminal-studio
style. The section has a status summary and a short list of checks:

- `ready` when there are no issues or warnings.
- `warnings` when the export is allowed but the user should review one or more
  platform risks.
- `issues` when the export cannot proceed with the current selection.

The panel shows the highest-signal items first. When there are warnings or
issues, it shows up to four non-pass checks. When everything passes, it shows a
small pass summary so the panel still confirms that checks ran. Each item has a
severity label, a short title, a brief explanation, and optional platform tags.

The download button keeps the current behavior:

- Disabled while exporting.
- Disabled when no platform is selected.
- Enabled when only warnings are present.

## Readiness Model

Add `src/lib/readiness.ts`:

```ts
import type { PlatformId } from "@/lib/exportPresets";

export type ReadinessSeverity = "pass" | "warning" | "issue";

export type ReadinessCheck = {
  id: string;
  severity: ReadinessSeverity;
  title: string;
  detail: string;
  platformIds?: PlatformId[];
};

export type ReadinessReport = {
  status: "ready" | "warnings" | "issues";
  checks: ReadinessCheck[];
};
```

The primary API is:

```ts
export function getReadinessReport(
  config: IconConfig,
  selected: PlatformId[],
): ReadinessReport;
```

Status aggregation is deterministic:

- Any `issue` check makes the report `issues`.
- Otherwise, any `warning` check makes the report `warnings`.
- Otherwise the report is `ready`.

`IconStudio` owns `config` and `selected`, so it computes the report and passes
it into `ExportPanel`. This keeps `ExportPanel` focused on rendering export UI
and leaves room for future analytics or button affordances without duplicating
readiness calls.

## First Rules

The initial rule set intentionally favors stable, explainable heuristics:

1. **Platform selection**
   - If `selected.length === 0`, emit an `issue`.
   - If platforms are selected and every selected platform exists in the
     registry, emit a `pass`.

2. **Safe-zone risk**
   - If scale, offset, or rotation suggest foreground content may leave adaptive
     or maskable safe zones, emit a `warning`.
   - Associate this warning with selected platforms that rely on safe-zone
     variants: Android, WebApp/PWA, Expo, and HarmonyOS when present.
   - The rule is heuristic and based on the transform config, not pixel
     inspection.

3. **Small-size legibility**
   - If `fgMode === "text"` and the text is long enough to be hard to read in
     favicon-sized outputs, emit a `warning`.
   - Associate this with Web when selected.

4. **Contrast risk**
   - For text and Lucide icon foregrounds, compare the foreground color with
     the dominant configured background color.
   - If contrast is low, emit a `warning` associated with all selected
     platforms.
   - For image and emoji foregrounds, skip contrast analysis because the
     foreground is not represented by a single user-selected color.

5. **Registry-backed export shape**
   - If selected platforms have registry files and static files available, emit
     a `pass` summary that confirms the selected export set is known.

Future rules can be added without changing the UI contract as long as they
return `ReadinessCheck` entries.

## UI Components

Add a small `ReadinessPanel` component or private subcomponent used by
`ExportPanel`. It receives:

```ts
type ReadinessPanelProps = {
  report: ReadinessReport;
};
```

Styling follows `docs/design-system.md`:

- Compact mono typography.
- Hairline borders and existing semantic tokens.
- No marketing-style cards or large visual treatment.
- Platform tags use restrained text/border styling and do not resize the export
  column on state changes.

`ExportPanel` still derives platform labels, descriptions, and file counts from
`exportPresets`. Readiness text does not duplicate the file-list preview.

## Error Handling

Readiness checks are advisory logic. They must not throw for normal user input.
Unknown platform IDs should be treated as an `issue` only if they reach the
readiness API; normal UI selection already uses registry-backed IDs.

The feature does not change render failure behavior. Export-time failures still
surface through the existing export error state.

## Testing

Add focused tests:

- `src/lib/readiness.test.ts`
  - no selected platforms returns `issues`.
  - warnings aggregate to `warnings` without issues.
  - long text warns for Web favicon output.
  - transform risk warns for adaptive/maskable platforms.
  - low contrast warns for text/icon foregrounds and skips image/emoji.
  - selected registry-backed platforms include a pass summary.

- `src/components/ExportPanel.test.tsx`
  - renders readiness status and item text.
  - warnings do not disable download.
  - no selected platforms still disables download.
  - platform tags are visible for platform-specific warnings.

Run the baseline gate after implementation:

```sh
pnpm test && pnpm lint && pnpm typecheck && pnpm build
```

For meaningful layout changes in the export column, also run `pnpm test:e2e`.

## Out of Scope

- Pixel-level canvas analysis.
- ML or subjective visual scoring.
- Blocking export on warnings.
- New backend routes, auth, database, or server-side validation.
- Separate QA tab or standalone readiness dashboard.
- Per-platform auto-fixes. The first version reports risks only.
