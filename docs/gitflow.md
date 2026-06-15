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

## Enforcement

The `Branch Policy` job in `.github/workflows/quality.yml` enforces the targets:
pull requests may target `dev` from any branch, and may target `main` only from
`dev`; any other target fails.

Both `dev` and `main` have GitHub branch protection enabled:

- Direct pushes are blocked (including for admins); all changes land via pull
  request.
- `Verify`, `Coverage`, and `Branch Policy` must pass before merge.
- Force pushes and branch deletion are disabled.

Because `Branch Policy` is a required check on `main`, the only pull request that
can merge into `main` is a `dev` -> `main` promotion. Prefer a rebase merge for
that promotion so `main` stays a fast-forward of `dev`.
