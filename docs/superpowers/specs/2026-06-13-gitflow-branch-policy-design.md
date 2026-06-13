# GitFlow Branch Policy — Design

**Date:** 2026-06-13
**Status:** Approved

## Goal

Document and enforce a lightweight GitFlow policy for this repository:
development happens away from `main`, pull requests target `dev`, and `main`
stays reserved for release-ready code.

Automatic PR deployments are explicitly out of scope for this change.

## Decisions

1. Add `docs/gitflow.md` as the human-readable branch policy.
2. Use `feature/* -> dev -> main` as the default flow.
3. Do not make code changes directly on `main`.
4. Require pull requests to target `dev`.
5. Keep the existing quality workflow and add a small PR base-branch guard.
6. Do not add deployment automation in this scope.

## Branch Policy

- `main`: release-ready branch only. Tags and releases are created from this
  branch after validation.
- `dev`: integration branch for completed work before release.
- `feature/<short-name>`: normal feature branches.
- `fix/<short-name>`: bug-fix branches.
- `docs/<short-name>`: documentation-only branches.
- `chore/<short-name>`: maintenance branches.

Normal development flow:

```text
feature/* -> PR to dev -> merge dev to main for release -> pnpm release
```

The local release command remains `pnpm release`; it already requires `main`,
a clean working tree, quality checks, and creates an annotated version tag.

## CI Enforcement

Update `.github/workflows/quality.yml` with a `branch-policy` job that runs only
for pull requests. It checks `github.base_ref` and fails unless the PR targets
`dev`.

The failure message should tell contributors to open PRs against `dev`.

The existing `verify`, `coverage`, and `e2e` jobs stay intact. Push checks on
`main` stay intact. No deployment job is added.

## Testing

Because GitHub context is only available in Actions, validation is primarily
static:

- Run `pnpm lint` to validate Markdown, YAML-adjacent repository hygiene, and
  formatting.
- Run `pnpm typecheck` to keep the baseline clean.

No app runtime behavior changes are expected.

## Out of Scope

- Automatic deployments.
- GitHub branch protection configuration, which must be configured in GitHub
  repository settings.
- Creating the `dev` branch remotely.
- Rewriting existing commits made on `main`.
