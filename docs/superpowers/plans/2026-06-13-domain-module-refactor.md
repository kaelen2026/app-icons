# Domain Module Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the export domain into `src/modules/exporting` without changing app behavior.

**Architecture:** Move export-owned components, hooks, pure logic, and tests into one domain module. Leave old path shims so existing callers continue to work, then update `IconStudio` to use the module public API as the pilot consumer.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library, existing `@/` import alias.

---

## File Structure

Create:

- `src/modules/exporting/index.ts`
- `src/modules/exporting/components/ExportPanel.tsx`
- `src/modules/exporting/hooks/useIconExport.ts`
- `src/modules/exporting/lib/exportPresets.ts`
- `src/modules/exporting/lib/exportZip.ts`
- `src/modules/exporting/lib/ico.ts`
- `src/modules/exporting/lib/readiness.ts`
- `src/modules/exporting/__tests__/ExportPanel.test.tsx`
- `src/modules/exporting/__tests__/useIconExport.test.tsx`
- `src/modules/exporting/__tests__/exportPresets.test.ts`
- `src/modules/exporting/__tests__/exportZip.test.ts`
- `src/modules/exporting/__tests__/ico.test.ts`
- `src/modules/exporting/__tests__/readiness.test.ts`

Replace old paths with shims:

- `src/components/ExportPanel.tsx`
- `src/components/useIconExport.ts`
- `src/lib/exportPresets.ts`
- `src/lib/exportZip.ts`
- `src/lib/ico.ts`
- `src/lib/readiness.ts`

Delete old tests after moving them to `src/modules/exporting/__tests__/`.

Modify:

- `src/components/IconStudio.tsx`

---

### Task 1: Move Pure Export Logic

**Files:**
- Move: `src/lib/exportPresets.ts` -> `src/modules/exporting/lib/exportPresets.ts`
- Move: `src/lib/exportZip.ts` -> `src/modules/exporting/lib/exportZip.ts`
- Move: `src/lib/ico.ts` -> `src/modules/exporting/lib/ico.ts`
- Move: `src/lib/readiness.ts` -> `src/modules/exporting/lib/readiness.ts`
- Move tests from `src/lib/*` to `src/modules/exporting/__tests__/`
- Create shims at old `src/lib/*` paths
- Create/extend `src/modules/exporting/index.ts`

- [ ] **Step 1: Move files**

Run:

```sh
mkdir -p src/modules/exporting/lib src/modules/exporting/__tests__
git mv src/lib/exportPresets.ts src/modules/exporting/lib/exportPresets.ts
git mv src/lib/exportZip.ts src/modules/exporting/lib/exportZip.ts
git mv src/lib/ico.ts src/modules/exporting/lib/ico.ts
git mv src/lib/readiness.ts src/modules/exporting/lib/readiness.ts
git mv src/lib/exportPresets.test.ts src/modules/exporting/__tests__/exportPresets.test.ts
git mv src/lib/exportZip.test.ts src/modules/exporting/__tests__/exportZip.test.ts
git mv src/lib/ico.test.ts src/modules/exporting/__tests__/ico.test.ts
git mv src/lib/readiness.test.ts src/modules/exporting/__tests__/readiness.test.ts
```

- [ ] **Step 2: Fix internal imports in moved files**

In `src/modules/exporting/lib/exportZip.ts`, replace relative imports:

```ts
import type { Platform, PlatformId } from "./exportPresets";
import { platforms } from "./exportPresets";
import { encodeIco } from "./ico";
import { renderIcon } from "@/lib/renderIcon";
```

In `src/modules/exporting/lib/readiness.ts`, keep platform imports local:

```ts
import { type PlatformId, platforms } from "./exportPresets";
```

- [ ] **Step 3: Fix moved test imports**

Update moved test imports to module-local paths:

```ts
import { exportFileList, platforms, sizeForPath } from "../lib/exportPresets";
import { exportZip, zipFileName } from "../lib/exportZip";
import { encodeIco } from "../lib/ico";
import { getReadinessReport } from "../lib/readiness";
```

Keep any `@/types/icon` imports unchanged.

- [ ] **Step 4: Add old-path shims**

Create `src/lib/exportPresets.ts`:

```ts
export type {
  IcoFile,
  Platform,
  PlatformFile,
  PlatformId,
  StaticFile,
} from "@/modules/exporting/lib/exportPresets";
export {
  allPlatformIds,
  exportFileList,
  extraExportFiles,
  platforms,
  sizeForPath,
} from "@/modules/exporting/lib/exportPresets";
```

Create `src/lib/exportZip.ts`:

```ts
export { exportZip, zipFileName } from "@/modules/exporting/lib/exportZip";
```

Create `src/lib/ico.ts`:

```ts
export { encodeIco } from "@/modules/exporting/lib/ico";
```

Create `src/lib/readiness.ts`:

```ts
export type {
  ReadinessCheck,
  ReadinessReport,
  ReadinessSeverity,
} from "@/modules/exporting/lib/readiness";
export { getReadinessReport } from "@/modules/exporting/lib/readiness";
```

- [ ] **Step 5: Create public module API**

Create `src/modules/exporting/index.ts`:

```ts
export type {
  IcoFile,
  Platform,
  PlatformFile,
  PlatformId,
  StaticFile,
} from "./lib/exportPresets";
export {
  allPlatformIds,
  exportFileList,
  extraExportFiles,
  platforms,
  sizeForPath,
} from "./lib/exportPresets";
export { exportZip, zipFileName } from "./lib/exportZip";
export { encodeIco } from "./lib/ico";
export type {
  ReadinessCheck,
  ReadinessReport,
  ReadinessSeverity,
} from "./lib/readiness";
export { getReadinessReport } from "./lib/readiness";
```

- [ ] **Step 6: Run focused tests**

Run:

```sh
pnpm vitest run src/modules/exporting/__tests__/exportPresets.test.ts src/modules/exporting/__tests__/exportZip.test.ts src/modules/exporting/__tests__/ico.test.ts src/modules/exporting/__tests__/readiness.test.ts
```

Expected: all moved pure logic tests pass.

- [ ] **Step 7: Commit**

```sh
git add src/lib src/modules/exporting
git commit -m "refactor: move export logic into module"
```

---

### Task 2: Move Export UI And Hook

**Files:**
- Move: `src/components/ExportPanel.tsx` -> `src/modules/exporting/components/ExportPanel.tsx`
- Move: `src/components/useIconExport.ts` -> `src/modules/exporting/hooks/useIconExport.ts`
- Move tests to `src/modules/exporting/__tests__/`
- Replace old component/hook paths with shims
- Extend `src/modules/exporting/index.ts`

- [ ] **Step 1: Move files**

Run:

```sh
mkdir -p src/modules/exporting/components src/modules/exporting/hooks
git mv src/components/ExportPanel.tsx src/modules/exporting/components/ExportPanel.tsx
git mv src/components/useIconExport.ts src/modules/exporting/hooks/useIconExport.ts
git mv src/components/ExportPanel.test.tsx src/modules/exporting/__tests__/ExportPanel.test.tsx
git mv src/components/useIconExport.test.tsx src/modules/exporting/__tests__/useIconExport.test.tsx
```

- [ ] **Step 2: Update moved implementation imports**

In `src/modules/exporting/components/ExportPanel.tsx`, import from the module:

```ts
import type { PlatformId } from "@/modules/exporting";
import {
  exportFileList,
  extraExportFiles,
  platforms,
  sizeForPath,
} from "@/modules/exporting";
import type { ReadinessCheck, ReadinessReport } from "@/modules/exporting";
```

In `src/modules/exporting/hooks/useIconExport.ts`, import from the module:

```ts
import type { PlatformId } from "@/modules/exporting";
import { exportFileList } from "@/modules/exporting";
import {
  exportZip as defaultExportZip,
  zipFileName,
} from "@/modules/exporting";
```

- [ ] **Step 3: Update moved test imports**

In `src/modules/exporting/__tests__/ExportPanel.test.tsx`:

```ts
import ExportPanel from "../components/ExportPanel";
import { platforms } from "@/modules/exporting";
import type { ReadinessCheck, ReadinessReport } from "@/modules/exporting";
```

In `src/modules/exporting/__tests__/useIconExport.test.tsx`:

```ts
import { useIconExport } from "../hooks/useIconExport";
import type { PlatformId } from "@/modules/exporting";
```

- [ ] **Step 4: Add old-path shims**

Create `src/components/ExportPanel.tsx`:

```ts
export { default } from "@/modules/exporting/components/ExportPanel";
```

Create `src/components/useIconExport.ts`:

```ts
export { useIconExport } from "@/modules/exporting/hooks/useIconExport";
```

- [ ] **Step 5: Extend public module API**

Update `src/modules/exporting/index.ts`:

```ts
export { default as ExportPanel } from "./components/ExportPanel";
export { useIconExport } from "./hooks/useIconExport";
```

Keep all exports from Task 1.

- [ ] **Step 6: Run focused tests**

Run:

```sh
pnpm vitest run src/modules/exporting/__tests__/ExportPanel.test.tsx src/modules/exporting/__tests__/useIconExport.test.tsx
```

Expected: both moved UI/hook tests pass.

- [ ] **Step 7: Commit**

```sh
git add src/components src/modules/exporting
git commit -m "refactor: move export ui into module"
```

---

### Task 3: Update Pilot Consumer Imports

**Files:**
- Modify: `src/components/IconStudio.tsx`

- [ ] **Step 1: Update `IconStudio` imports**

Replace export-related imports in `src/components/IconStudio.tsx`:

```ts
import {
  allPlatformIds,
  ExportPanel,
  getReadinessReport,
  type PlatformId,
  useIconExport,
} from "@/modules/exporting";
```

Remove these old imports:

```ts
import ExportPanel from "@/components/ExportPanel";
import { useIconExport } from "@/components/useIconExport";
import type { PlatformId } from "@/lib/exportPresets";
import { allPlatformIds } from "@/lib/exportPresets";
import { getReadinessReport } from "@/lib/readiness";
```

- [ ] **Step 2: Run focused tests**

Run:

```sh
pnpm vitest run src/components/IconStudio.test.tsx src/modules/exporting/__tests__/ExportPanel.test.tsx src/modules/exporting/__tests__/useIconExport.test.tsx
pnpm typecheck
```

Expected: tests and typecheck pass.

- [ ] **Step 3: Commit**

```sh
git add src/components/IconStudio.tsx
git commit -m "refactor: consume export module from studio"
```

---

### Task 4: Final Verification

**Files:**
- No source changes expected unless verification finds a bug.

- [ ] **Step 1: Run full verification**

Run:

```sh
pnpm test
pnpm lint
pnpm lint:dead-code
pnpm typecheck
pnpm build
```

Expected: all commands pass.

- [ ] **Step 2: Run E2E export smoke**

Because the export UI/hook moved, run:

```sh
pnpm test:e2e
```

Expected: pass.

- [ ] **Step 3: Inspect imports and shims**

Run:

```sh
rg -n "@/components/(ExportPanel|useIconExport)|@/lib/(exportPresets|exportZip|ico|readiness)" src
git status --short
```

Expected: old-path imports may remain only where intentionally covered by shims
or tests outside the export module. Worktree should be clean after commits.

- [ ] **Step 4: Report outcome**

Summarize moved files, old shims, updated consumer imports, and exact
verification results.
