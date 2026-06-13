# Release Tag Script Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `pnpm release` to run release checks and create an annotated Git tag from `package.json.version`.

**Architecture:** Implement a small Node script with pure helper functions plus a CLI entrypoint. Tests use Node's built-in test runner for helper behavior and avoid creating real Git tags.

**Tech Stack:** Node.js ESM, `node:test`, `node:assert/strict`, pnpm scripts, Git CLI.

---

### Task 1: Release Script And Tests

**Files:**
- Create: `scripts/release.mjs`
- Create: `scripts/release.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing tests**

Create `scripts/release.test.mjs` with tests for `formatTagName`, `assertValidVersion`, `assertMainBranch`, and `assertCleanStatus`.

- [ ] **Step 2: Run tests to verify failure**

Run `node --test scripts/release.test.mjs`. Expected: fail because `scripts/release.mjs` does not exist.

- [ ] **Step 3: Implement script**

Create `scripts/release.mjs` exporting pure helpers and running the CLI only when invoked directly. The CLI must check branch, clean status, version, existing tag, run `pnpm quality`, create `git tag -a v<version> -m "Release v<version>"`, and print `git push origin main --tags`.

- [ ] **Step 4: Add package script**

Add `"release": "node scripts/release.mjs"` to `package.json`.

- [ ] **Step 5: Verify**

Run:

```sh
node --test scripts/release.test.mjs
pnpm lint
pnpm typecheck
```

- [ ] **Step 6: Commit**

```sh
git add scripts/release.mjs scripts/release.test.mjs package.json docs/superpowers/plans/2026-06-13-release-tag.md
git commit -m "feat: add release tag script"
```
