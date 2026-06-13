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
