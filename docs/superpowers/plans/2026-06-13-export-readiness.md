# Export Readiness Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an inline export readiness panel that warns about likely platform export problems before ZIP download.

**Architecture:** Put readiness rules in a pure `src/lib/readiness.ts` module and keep React as presentation only. `IconStudio` computes `getReadinessReport(config, selected)` because it owns both inputs, then passes the report to `ExportPanel`, which renders a compact status section without changing export behavior.

**Tech Stack:** Next.js client components, React 19, TypeScript, Vitest, Testing Library, existing Tailwind design tokens.

---

## File Structure

- Create `src/lib/readiness.ts`: pure rule engine and exported readiness types.
- Create `src/lib/readiness.test.ts`: unit tests for report aggregation and all first-version heuristics.
- Modify `src/components/ExportPanel.tsx`: add `readiness` prop and render a compact inline readiness section.
- Modify `src/components/ExportPanel.test.tsx`: add readiness fixture and UI behavior tests.
- Modify `src/components/IconStudio.tsx`: import `useMemo`, compute report, pass it to `ExportPanel`.

Do not modify Canvas rendering, export ZIP generation, platform registry behavior, persistence, or `IconConfig`.

---

### Task 1: Readiness Rule Engine

**Files:**
- Create: `src/lib/readiness.ts`
- Create: `src/lib/readiness.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/readiness.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getReadinessReport } from "@/lib/readiness";
import { defaultIconConfig } from "@/types/icon";
import type { IconConfig } from "@/types/icon";

function config(patch: Partial<IconConfig>): IconConfig {
  return { ...defaultIconConfig, ...patch };
}

describe("getReadinessReport", () => {
  it("returns issues when no platform is selected", () => {
    const report = getReadinessReport(defaultIconConfig, []);

    expect(report.status).toBe("issues");
    expect(report.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "platform-selection",
          severity: "issue",
        }),
      ]),
    );
  });

  it("returns warnings without blocking when transform values risk safe zones", () => {
    const report = getReadinessReport(
      config({ scale: 95, offsetX: 18, rotation: 20 }),
      ["android", "webapp", "expo"],
    );

    expect(report.status).toBe("warnings");
    expect(report.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "safe-zone-risk",
          severity: "warning",
          platformIds: ["android", "webapp", "expo"],
        }),
      ]),
    );
  });

  it("warns when text is likely unreadable in web favicon sizes", () => {
    const report = getReadinessReport(
      config({ fgMode: "text", text: "LONGNAME" }),
      ["web"],
    );

    expect(report.status).toBe("warnings");
    expect(report.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "small-text-legibility",
          severity: "warning",
          platformIds: ["web"],
        }),
      ]),
    );
  });

  it("warns for low contrast text and icon foregrounds", () => {
    const textReport = getReadinessReport(
      config({
        fgMode: "text",
        textColor: "#202020",
        bgColor1: "#1f1f1f",
        bgColor2: "#242424",
        bgType: "solid",
      }),
      ["ios", "web"],
    );

    expect(textReport.status).toBe("warnings");
    expect(textReport.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "contrast-risk",
          severity: "warning",
          platformIds: ["ios", "web"],
        }),
      ]),
    );

    const iconReport = getReadinessReport(
      config({
        fgMode: "icon",
        iconColor: "#202020",
        bgColor1: "#1f1f1f",
        bgColor2: "#242424",
        bgType: "solid",
      }),
      ["android"],
    );

    expect(iconReport.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "contrast-risk" }),
      ]),
    );
  });

  it("skips contrast warnings for image and emoji foregrounds", () => {
    const imageReport = getReadinessReport(
      config({
        fgMode: "image",
        bgColor1: "#1f1f1f",
        bgColor2: "#242424",
        bgType: "solid",
      }),
      ["ios"],
    );
    const emojiReport = getReadinessReport(
      config({
        fgMode: "emoji",
        bgColor1: "#1f1f1f",
        bgColor2: "#242424",
        bgType: "solid",
      }),
      ["ios"],
    );

    expect(imageReport.checks.some((check) => check.id === "contrast-risk")).toBe(
      false,
    );
    expect(emojiReport.checks.some((check) => check.id === "contrast-risk")).toBe(
      false,
    );
  });

  it("returns ready with pass summaries for a conservative known export", () => {
    const report = getReadinessReport(
      config({ scale: 56, offsetX: 0, offsetY: 0, rotation: 0 }),
      ["ios"],
    );

    expect(report.status).toBe("ready");
    expect(report.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "platform-selection",
          severity: "pass",
        }),
        expect.objectContaining({
          id: "registry-export-shape",
          severity: "pass",
          platformIds: ["ios"],
        }),
      ]),
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```sh
pnpm vitest run src/lib/readiness.test.ts
```

Expected: FAIL because `src/lib/readiness.ts` does not exist.

- [ ] **Step 3: Implement the readiness module**

Create `src/lib/readiness.ts`:

```ts
import type { PlatformId } from "@/lib/exportPresets";
import { platforms } from "@/lib/exportPresets";
import type { IconConfig } from "@/types/icon";

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

const SAFE_ZONE_PLATFORMS = new Set<PlatformId>([
  "android",
  "harmony",
  "webapp",
  "expo",
]);

const FAVICON_TEXT_LIMIT = 3;
const MIN_CONTRAST_RATIO = 3;

export function getReadinessReport(
  config: IconConfig,
  selected: PlatformId[],
): ReadinessReport {
  const checks: ReadinessCheck[] = [];
  const knownPlatformIds = new Set(platforms.map((platform) => platform.id));
  const unknown = selected.filter((id) => !knownPlatformIds.has(id));

  if (selected.length === 0) {
    checks.push({
      id: "platform-selection",
      severity: "issue",
      title: "No platforms selected",
      detail: "Select at least one platform before downloading a ZIP.",
    });
  } else if (unknown.length > 0) {
    checks.push({
      id: "platform-selection",
      severity: "issue",
      title: "Unknown platform selected",
      detail: `Remove unsupported platform selections: ${unknown.join(", ")}.`,
      platformIds: unknown,
    });
  } else {
    checks.push({
      id: "platform-selection",
      severity: "pass",
      title: "Platforms selected",
      detail: `${selected.length} platform${selected.length === 1 ? "" : "s"} ready for export.`,
      platformIds: selected,
    });
  }

  const safeZonePlatforms = selected.filter((id) => SAFE_ZONE_PLATFORMS.has(id));
  if (safeZonePlatforms.length > 0 && hasSafeZoneRisk(config)) {
    checks.push({
      id: "safe-zone-risk",
      severity: "warning",
      title: "Foreground may exceed safe zones",
      detail:
        "Large scale, offset, or rotation can be clipped by adaptive and maskable icon masks.",
      platformIds: safeZonePlatforms,
    });
  }

  if (
    selected.includes("web") &&
    config.fgMode === "text" &&
    config.text.trim().length > FAVICON_TEXT_LIMIT
  ) {
    checks.push({
      id: "small-text-legibility",
      severity: "warning",
      title: "Text may be hard to read",
      detail: "Long text usually collapses at 16px and 32px favicon sizes.",
      platformIds: ["web"],
    });
  }

  const contrastColor = foregroundColor(config);
  if (selected.length > 0 && contrastColor !== null) {
    const contrast = contrastRatio(contrastColor, dominantBackgroundColor(config));
    if (contrast < MIN_CONTRAST_RATIO) {
      checks.push({
        id: "contrast-risk",
        severity: "warning",
        title: "Low foreground contrast",
        detail:
          "The foreground color is close to the background and may disappear at small sizes.",
        platformIds: selected,
      });
    }
  }

  const knownSelected = selected.filter((id) => knownPlatformIds.has(id));
  if (knownSelected.length > 0) {
    checks.push({
      id: "registry-export-shape",
      severity: "pass",
      title: "Export files are registered",
      detail: "Selected platform files and metadata are available in the export registry.",
      platformIds: knownSelected,
    });
  }

  return {
    status: aggregateStatus(checks),
    checks,
  };
}

function aggregateStatus(checks: ReadinessCheck[]): ReadinessReport["status"] {
  if (checks.some((check) => check.severity === "issue")) return "issues";
  if (checks.some((check) => check.severity === "warning")) return "warnings";
  return "ready";
}

function hasSafeZoneRisk(config: IconConfig): boolean {
  return (
    config.scale > 72 ||
    Math.abs(config.offsetX) > 12 ||
    Math.abs(config.offsetY) > 12 ||
    Math.abs(config.rotation) > 12
  );
}

function foregroundColor(config: IconConfig): string | null {
  if (config.fgMode === "text") return config.textColor;
  if (config.fgMode === "icon") return config.iconColor;
  return null;
}

function dominantBackgroundColor(config: IconConfig): string {
  return config.bgColor1;
}

function contrastRatio(foreground: string, background: string): number {
  const fg = relativeLuminance(hexToRgb(foreground));
  const bg = relativeLuminance(hexToRgb(background));
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.trim().replace(/^#/, "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  if (!/^[\da-f]{6}$/i.test(value)) return [0, 0, 0];

  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function relativeLuminance([red, green, blue]: [number, number, number]): number {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

- [ ] **Step 4: Run the unit test**

Run:

```sh
pnpm vitest run src/lib/readiness.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```sh
git add src/lib/readiness.ts src/lib/readiness.test.ts
git commit -m "feat: add export readiness rules"
```

---

### Task 2: Export Panel Readiness UI

**Files:**
- Modify: `src/components/ExportPanel.tsx`
- Modify: `src/components/ExportPanel.test.tsx`

- [ ] **Step 1: Update component tests first**

Replace `src/components/ExportPanel.test.tsx` with:

```ts
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ExportPanel from "@/components/ExportPanel";
import type { ReadinessReport } from "@/lib/readiness";

const readyReport: ReadinessReport = {
  status: "ready",
  checks: [
    {
      id: "platform-selection",
      severity: "pass",
      title: "Platforms selected",
      detail: "1 platform ready for export.",
      platformIds: ["web"],
    },
  ],
};

const warningReport: ReadinessReport = {
  status: "warnings",
  checks: [
    {
      id: "safe-zone-risk",
      severity: "warning",
      title: "Foreground may exceed safe zones",
      detail: "Large scale, offset, or rotation can be clipped.",
      platformIds: ["android", "webapp"],
    },
  ],
};

const issueReport: ReadinessReport = {
  status: "issues",
  checks: [
    {
      id: "platform-selection",
      severity: "issue",
      title: "No platforms selected",
      detail: "Select at least one platform before downloading a ZIP.",
    },
  ],
};

const baseProps = {
  exporting: false,
  completed: [],
  readiness: readyReport,
  saved: false,
  selected: ["web" as const],
  zipName: "my-app-icons.zip",
  onToggle: vi.fn(),
  onSelectAll: vi.fn(),
  onDownload: vi.fn(),
};

describe("ExportPanel", () => {
  it("toggles platforms and starts a download", async () => {
    const onToggle = vi.fn();
    const onDownload = vi.fn();
    const user = userEvent.setup();

    render(
      <ExportPanel
        {...baseProps}
        onToggle={onToggle}
        onDownload={onDownload}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: /iOS/i }));
    await user.click(screen.getByRole("button", { name: "download .zip" }));

    expect(onToggle).toHaveBeenCalledWith("ios");
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it("shows empty and saved states", () => {
    const { rerender } = render(
      <ExportPanel
        {...baseProps}
        readiness={issueReport}
        selected={[]}
        zipName="empty-icons.zip"
      />,
    );

    expect(screen.getByText("no platforms selected")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "download .zip" }),
    ).toBeDisabled();

    rerender(<ExportPanel {...baseProps} saved zipName="client-icons.zip" />);

    expect(screen.getByText("client-icons.zip ✓ saved")).toBeInTheDocument();
  });

  it("selects or clears every platform from the select-all control", async () => {
    const onSelectAll = vi.fn();
    const user = userEvent.setup();

    render(
      <ExportPanel
        {...baseProps}
        readiness={issueReport}
        selected={[]}
        onSelectAll={onSelectAll}
      />,
    );

    await user.click(screen.getByRole("button", { name: "select all" }));

    expect(onSelectAll).toHaveBeenCalledWith(true);
  });

  it("renders readiness warnings without disabling download", () => {
    render(
      <ExportPanel
        {...baseProps}
        readiness={warningReport}
        selected={["android", "webapp"]}
      />,
    );

    expect(screen.getByText("readiness")).toBeInTheDocument();
    expect(screen.getByText("warnings · 1 item needs review")).toBeInTheDocument();
    expect(screen.getByText("Foreground may exceed safe zones")).toBeInTheDocument();
    expect(screen.getByText("android")).toBeInTheDocument();
    expect(screen.getByText("webapp")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "download .zip" }),
    ).not.toBeDisabled();
  });

  it("renders issue status while no-platform selection disables download", () => {
    render(
      <ExportPanel {...baseProps} readiness={issueReport} selected={[]} />,
    );

    expect(screen.getByText("issues · 1 item needs review")).toBeInTheDocument();
    expect(screen.getByText("No platforms selected")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "download .zip" }),
    ).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run component test to verify it fails**

Run:

```sh
pnpm vitest run src/components/ExportPanel.test.tsx
```

Expected: FAIL because `ExportPanel` does not accept or render `readiness`.

- [ ] **Step 3: Implement the readiness UI**

In `src/components/ExportPanel.tsx`, add:

```ts
import type { ReadinessCheck, ReadinessReport } from "@/lib/readiness";
```

Add `readiness: ReadinessReport;` to `Props`.

Add these helper functions above the default component:

```tsx
function ReadinessPanel({ report }: { report: ReadinessReport }) {
  const visibleChecks = checksToDisplay(report.checks);
  const reviewCount = report.checks.filter(
    (check) => check.severity !== "pass",
  ).length;
  const summary =
    report.status === "ready"
      ? `ready · ${report.checks.length} checks`
      : `${report.status} · ${reviewCount} item${reviewCount === 1 ? "" : "s"} needs review`;

  return (
    <div className="border-t border-hairline pt-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] tracking-[0.18em] text-text-faint">
          readiness
        </h2>
        <p className={`text-[11px] ${statusClass(report.status)}`}>{summary}</p>
      </div>
      <ul className="mt-2 space-y-2 text-[11px]">
        {visibleChecks.map((check) => (
          <ReadinessRow key={check.id} check={check} />
        ))}
      </ul>
    </div>
  );
}

function ReadinessRow({ check }: { check: ReadinessCheck }) {
  return (
    <li className="rounded-sm border border-hairline bg-panel-2 px-2 py-2">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] ${severityClass(check.severity)}`}>
          {check.severity}
        </span>
        <span className="min-w-0 flex-1 truncate text-text">{check.title}</span>
      </div>
      <p className="mt-1 text-text-faint">{check.detail}</p>
      {check.platformIds && check.platformIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {check.platformIds.map((id) => (
            <span
              key={id}
              className="rounded-sm border border-hairline px-1.5 py-0.5 text-[10px] text-text-dim"
            >
              {id}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}

function checksToDisplay(checks: ReadinessCheck[]): ReadinessCheck[] {
  const reviewChecks = checks.filter((check) => check.severity !== "pass");
  if (reviewChecks.length > 0) return reviewChecks.slice(0, 4);
  return checks.slice(0, 3);
}

function statusClass(status: ReadinessReport["status"]): string {
  if (status === "ready") return "text-accent";
  if (status === "warnings") return "text-amber-400";
  return "text-red-400";
}

function severityClass(severity: ReadinessCheck["severity"]): string {
  if (severity === "pass") return "text-accent";
  if (severity === "warning") return "text-amber-400";
  return "text-red-400";
}
```

Render the panel after the platform checkbox list and before the `manifest` heading:

```tsx
<ReadinessPanel report={readiness} />
```

Destructure `readiness` from props in the component signature.

- [ ] **Step 4: Run component test**

Run:

```sh
pnpm vitest run src/components/ExportPanel.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```sh
git add src/components/ExportPanel.tsx src/components/ExportPanel.test.tsx
git commit -m "feat: show export readiness"
```

---

### Task 3: Wire Readiness Into IconStudio

**Files:**
- Modify: `src/components/IconStudio.tsx`
- Test: existing component and typecheck coverage

- [ ] **Step 1: Update imports**

In `src/components/IconStudio.tsx`, change the React import to include `useMemo`:

```ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
```

Add:

```ts
import { getReadinessReport } from "@/lib/readiness";
```

- [ ] **Step 2: Compute the report**

After the `useIconExport` call and before callbacks, add:

```ts
const readiness = useMemo(
  () => getReadinessReport(config, selected),
  [config, selected],
);
```

- [ ] **Step 3: Pass the report to ExportPanel**

Find the `ExportPanel` usage in `IconStudio.tsx` and add:

```tsx
readiness={readiness}
```

Keep all existing export props unchanged.

- [ ] **Step 4: Run focused checks**

Run:

```sh
pnpm vitest run src/components/IconStudio.test.tsx src/components/ExportPanel.test.tsx src/lib/readiness.test.ts
pnpm typecheck
```

Expected: PASS for all tests and typecheck.

- [ ] **Step 5: Commit**

```sh
git add src/components/IconStudio.tsx
git commit -m "feat: wire export readiness report"
```

---

### Task 4: Final Verification

**Files:**
- No source changes expected unless verification finds a bug.

- [ ] **Step 1: Run baseline gate**

Run:

```sh
pnpm test && pnpm lint && pnpm typecheck && pnpm build
```

Expected: all commands pass.

- [ ] **Step 2: Run UI/export e2e if layout changed significantly**

Because this adds visible UI to the export column, run:

```sh
pnpm test:e2e
```

Expected: PASS.

- [ ] **Step 3: Inspect final diff**

Run:

```sh
git status --short
git log --oneline -4
```

Expected: worktree clean after the task commits; recent commits include the three feature commits.

- [ ] **Step 4: Report outcome**

Summarize:

- readiness rules added in `src/lib/readiness.ts`.
- export panel now shows inline readiness.
- `IconStudio` passes live config and platform selection into the report.
- exact verification commands run and their pass/fail status.
