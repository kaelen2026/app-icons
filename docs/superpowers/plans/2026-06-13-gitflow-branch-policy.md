# GitFlow Branch Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Document the repository GitFlow policy and make CI fail pull requests that target a branch other than `dev`.

**Architecture:** Keep the policy in `docs/gitflow.md` for humans and enforce the PR target with a small GitHub Actions job in the existing quality workflow. No deployment automation is added.

**Tech Stack:** Markdown, GitHub Actions YAML, existing `pnpm lint` and `pnpm typecheck` verification.

---

### Task 1: GitFlow Documentation And PR Base Guard

**Files:**
- Create: `docs/gitflow.md`
- Modify: `.github/workflows/quality.yml`

- [ ] **Step 1: Add GitFlow documentation**

Create `docs/gitflow.md` with the branch roles and normal flow:

```md
# GitFlow

This repository uses a lightweight GitFlow policy:

- `main` is release-ready only.
- `dev` is the integration branch.
- Work starts from short-lived branches such as `feature/<name>`, `fix/<name>`,
  `docs/<name>`, or `chore/<name>`.
- Pull requests must target `dev`.
- Release changes are promoted from `dev` to `main`.
- Run `pnpm release` from `main` after the release gate passes.

Do not make feature, fix, documentation, or maintenance changes directly on
`main`. Use a short-lived branch and open a PR to `dev`.
```

- [ ] **Step 2: Add PR target enforcement**

Modify `.github/workflows/quality.yml` to add this job before `verify`:

```yaml
  branch-policy:
    name: Branch Policy
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - name: Require PRs to target dev
        if: github.base_ref != 'dev'
        run: |
          echo "Pull requests must target dev. Change this PR base branch to dev."
          exit 1
```

Keep existing `verify`, `coverage`, and `e2e` jobs unchanged.

- [ ] **Step 3: Verify**

Run:

```sh
pnpm lint
pnpm typecheck
```

Expected: both pass.

- [ ] **Step 4: Commit**

```sh
git add docs/gitflow.md .github/workflows/quality.yml docs/superpowers/plans/2026-06-13-gitflow-branch-policy.md
git commit -m "chore: enforce gitflow branch policy"
```
