#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const textExtensions = new Set([
  ".css",
  ".cjs",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".jsx",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yml",
  ".yaml",
]);

const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);

const failures = [];

const forbiddenBasenames = new Set([".DS_Store", "Thumbs.db"]);
const conflictMarkerPattern = /^(<{7}|={7}|>{7})/m;
const debugLogPattern = /\bconsole\.(log|debug)\s*\(/;

for (const file of trackedFiles) {
  if (!existsSync(file)) {
    continue;
  }

  const basename = path.basename(file);
  if (forbiddenBasenames.has(basename)) {
    failures.push(`${file}: remove local system file from version control`);
    continue;
  }

  const extension = path.extname(file);
  if (!textExtensions.has(extension)) {
    continue;
  }

  const contents = readFileSync(file, "utf8");

  if (conflictMarkerPattern.test(contents)) {
    failures.push(`${file}: contains merge conflict markers`);
  }

  const isSourceFile =
    file.startsWith("src/") && /\.(js|jsx|ts|tsx)$/.test(file);
  const isTestFile = /\.(test|spec)\.(js|jsx|ts|tsx)$/.test(file);
  if (isSourceFile && !isTestFile && debugLogPattern.test(contents)) {
    failures.push(`${file}: remove console.log/debug before committing`);
  }
}

if (failures.length > 0) {
  console.error("Repository hygiene check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Repository hygiene check passed (${trackedFiles.length} tracked files).`,
);
