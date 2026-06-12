#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const scanRoots = ["src/components", "src/app"];
const skipFiles = new Set([
  "src/app/globals.css",
  "src/app/manifest.ts",
  "src/app/opengraph-image.tsx",
]);

const colorFamilies = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
].join("|");

const rules = [
  {
    id: "hardcoded-color",
    message:
      "Use design tokens from globals.css instead of hardcoded hex colors.",
    pattern: /#[0-9a-fA-F]{3,8}\b/g,
  },
  {
    id: "tailwind-color",
    message:
      "Use semantic color tokens like bg-ink, text-text-dim, border-hairline, or accent.",
    pattern: new RegExp(
      String.raw`\b(?:bg|text|border|from|to|via|ring|outline|decoration|accent)-(?:${colorFamilies})-(?:50|100|200|300|400|500|600|700|800|900|950)(?:\/\d+)?\b`,
      "g",
    ),
    allow: new Set([
      "border-red-500/50",
      "hover:border-red-500/50",
      "text-red-400",
      "hover:text-red-400",
      "text-amber-400",
    ]),
  },
  {
    id: "large-radius",
    message:
      "Tool surfaces should use restrained radii; use rounded-sm unless previewing a real icon mask.",
    pattern: /\brounded-(?:lg|xl|2xl|3xl)\b/g,
  },
  {
    id: "decorative-background",
    message:
      "Avoid decorative orb/blob/bokeh patterns in this terminal-studio UI.",
    pattern: /\b(?:gradient-orb|decorative-blob|bokeh)\b/gi,
  },
];

async function listFiles(dir) {
  const entries = await readdir(path.join(root, dir), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(rel)));
      continue;
    }
    if (!/\.(ts|tsx|css)$/.test(entry.name)) continue;
    if (entry.name.includes(".test.")) continue;
    if (skipFiles.has(rel)) continue;
    files.push(rel);
  }
  return files;
}

function disabled(lines, index, ruleId) {
  const current = lines[index] ?? "";
  const previous = lines[index - 1] ?? "";
  return [current, previous].some((line) =>
    line.includes(`design-lint-disable-next-line ${ruleId}`),
  );
}

const findings = [];
const files = (await Promise.all(scanRoots.map(listFiles))).flat();

for (const file of files) {
  const source = await readFile(path.join(root, file), "utf8");
  const lines = source.split("\n");

  lines.forEach((line, index) => {
    for (const rule of rules) {
      rule.pattern.lastIndex = 0;
      for (const match of line.matchAll(rule.pattern)) {
        const token = match[0];
        if (rule.allow?.has(token)) continue;
        if (disabled(lines, index, rule.id)) continue;
        findings.push({
          file,
          line: index + 1,
          rule: rule.id,
          token,
          message: rule.message,
        });
      }
    }
  });
}

if (findings.length > 0) {
  console.error("Design lint failed:\n");
  for (const finding of findings) {
    console.error(
      `${finding.file}:${finding.line} [${finding.rule}] ${finding.token}`,
    );
    console.error(`  ${finding.message}`);
  }
  console.error(
    "\nIf an exception is intentional, document it with `design-lint-disable-next-line <rule>`.",
  );
  process.exit(1);
}

console.log(`Design lint passed (${files.length} files checked).`);
