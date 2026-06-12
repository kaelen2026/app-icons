import JSZip from "jszip";
import type { IconConfig } from "@/types/icon";
import type { Platform, PlatformId } from "./exportPresets";
import { platforms } from "./exportPresets";
import { renderIcon } from "./renderIcon";

function buildReadme(config: IconConfig, selected: Platform[]): string {
  const name = config.appName.trim() || "App";
  const sections = selected.map((p) => p.readmeSection(config)).join("\n\n");
  const fileLines = selected
    .flatMap((p) => [
      ...p.files.map((f) => `- \`${f.path}\` (${f.size}×${f.size})`),
      ...(p.staticFiles ?? []).map((f) => `- \`${f.path}\``),
    ])
    .join("\n");

  return `# ${name} — App Icons

Generated with App Icon Generator. All assets rendered in-browser from a single source image.

${sections}

## Files

${fileLines}
- \`icon-config.json\` — the configuration used to generate these icons
`;
}

export async function exportZip(
  config: IconConfig,
  selected: PlatformId[],
  onProgress?: (path: string) => void
): Promise<Blob> {
  const zip = new JSZip();
  const active = platforms.filter((p) => selected.includes(p.id));

  // Sequential so onProgress reflects real render completion per file
  for (const platform of active) {
    for (const file of platform.files) {
      const blob = await renderIcon(config, file.size, file.variant);
      zip.file(file.path, blob);
      onProgress?.(file.path);
    }
    for (const staticFile of platform.staticFiles ?? []) {
      zip.file(staticFile.path, staticFile.content(config));
      onProgress?.(staticFile.path);
    }
  }

  zip.file("README.md", buildReadme(config, active));
  onProgress?.("README.md");

  // Config snapshot, minus the (potentially huge) image data URL
  const { imageSrc, ...rest } = config;
  zip.file(
    "icon-config.json",
    JSON.stringify(
      { ...rest, hasImage: imageSrc !== null, platforms: selected },
      null,
      2
    )
  );
  onProgress?.("icon-config.json");

  return zip.generateAsync({ type: "blob" });
}
