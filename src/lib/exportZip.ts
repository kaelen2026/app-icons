import JSZip from "jszip";
import type { IconConfig } from "@/types/icon";
import { exportPresets } from "./exportPresets";
import { renderIcon } from "./renderIcon";

function buildReadme(config: IconConfig): string {
  const name = config.appName.trim() || "App";
  return `# ${name} — App Icons

Generated with App Icon Generator. All assets rendered in-browser from a single source image.

## Expo

Copy the \`expo/\` files into your project's \`assets/\` folder and reference them in \`app.json\`:

\`\`\`json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": { "image": "./assets/splash-icon.png" },
    "android": {
      "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png" }
    }
  }
}
\`\`\`

## Web / PWA

Copy the \`web/\` files into your \`public/\` folder and reference them in your HTML and manifest:

\`\`\`html
<link rel="icon" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
\`\`\`

\`\`\`json
{
  "icons": [
    { "src": "/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
\`\`\`

## Files

${exportPresets.map((p) => `- \`${p.path}\` (${p.size}×${p.size})`).join("\n")}
- \`icon-config.json\` — the configuration used to generate these icons
`;
}

export async function exportZip(config: IconConfig): Promise<Blob> {
  const zip = new JSZip();

  const blobs = await Promise.all(
    exportPresets.map((preset) => renderIcon(config, preset.size))
  );
  exportPresets.forEach((preset, i) => {
    zip.file(preset.path, blobs[i]);
  });

  zip.file("README.md", buildReadme(config));

  // Config snapshot, minus the (potentially huge) image data URL
  const { imageSrc, ...rest } = config;
  zip.file(
    "icon-config.json",
    JSON.stringify({ ...rest, hasImage: imageSrc !== null }, null, 2)
  );

  return zip.generateAsync({ type: "blob" });
}
