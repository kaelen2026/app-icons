#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { fileURLToPath } from "node:url";

const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

export function assertValidVersion(version) {
  if (typeof version !== "string" || !VERSION_PATTERN.test(version)) {
    throw new Error(`Invalid package version: ${String(version)}`);
  }
}

export function formatTagName(version) {
  assertValidVersion(version);
  return `v${version}`;
}

export function assertMainBranch(branch) {
  if (branch.trim() !== "main") {
    throw new Error(
      `Release must run from main; current branch is ${branch || "<none>"}.`,
    );
  }
}

export function assertCleanStatus(status) {
  if (status.trim() !== "") {
    throw new Error("Release working tree must be clean before tagging.");
  }
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
  });
}

async function readVersion() {
  const raw = await readFile(
    new URL("../package.json", import.meta.url),
    "utf8",
  );
  const pkg = JSON.parse(raw);
  assertValidVersion(pkg.version);
  return pkg.version;
}

function assertTagDoesNotExist(tagName) {
  try {
    run("git", ["rev-parse", "--verify", "--quiet", `refs/tags/${tagName}`]);
  } catch {
    return;
  }

  throw new Error(`Tag already exists: ${tagName}`);
}

export async function main() {
  const branch = run("git", ["branch", "--show-current"]).trim();
  assertMainBranch(branch);

  const status = run("git", ["status", "--short"]);
  assertCleanStatus(status);

  const version = await readVersion();
  const tagName = formatTagName(version);
  assertTagDoesNotExist(tagName);

  run("pnpm", ["quality"], { stdio: "inherit" });
  run("git", ["tag", "-a", tagName, "-m", `Release ${tagName}`], {
    stdio: "inherit",
  });

  console.log(`Created release tag ${tagName}.`);
  console.log("Push release with: git push origin main --tags");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
