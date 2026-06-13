# Release Tag Script — Design

**Date:** 2026-06-13
**Status:** Approved

## Goal

Add a local release command that creates a Git tag when publishing a version.
The command should make release tagging explicit, repeatable, and hard to run
from the wrong repository state.

## Decisions

1. Add `pnpm release` as the release entrypoint.
2. Read the release version from `package.json.version`.
3. Create an annotated Git tag named `v<version>`, for example `v0.1.0`.
4. Require a clean working tree and the `main` branch before tagging.
5. Run `pnpm quality` before creating the tag.
6. Do not push automatically. Print `git push origin main --tags` after the tag
   is created.

## Behavior

The release script exits non-zero when:

- The current branch is not `main`.
- The working tree is dirty.
- `package.json.version` is missing or invalid.
- The target tag already exists.
- `pnpm quality` fails.
- `git tag -a` fails.

On success, it creates the annotated tag:

```sh
git tag -a v0.1.0 -m "Release v0.1.0"
```

Then it prints a short next-step message telling the user how to push the tag.

## Implementation

Add `scripts/release.mjs` using Node built-ins only:

- `node:fs/promises` for reading `package.json`.
- `node:child_process` for running Git and pnpm commands.
- `node:process` for exit codes and stdio.

Add `"release": "node scripts/release.mjs"` to `package.json`.

Keep the script local and repository-specific. Do not add release automation to
GitHub Actions or Vercel in this scope.

## Testing

Add `scripts/release.test.mjs` using Node's built-in test runner. Unit-test the
small pure helpers used by the script:

- version validation.
- tag name formatting.
- dirty status detection.
- branch validation.

Run:

```sh
node --test scripts/release.test.mjs
pnpm lint
pnpm typecheck
```

The release command itself should not be executed during tests because it runs
the full quality gate and creates a Git tag.

## Out of Scope

- Automatically bumping versions.
- Generating changelogs.
- Creating GitHub releases.
- Pushing commits or tags.
- Deploying to Vercel.
