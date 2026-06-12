export type ExportPreset = {
  path: string;
  size: number;
};

export const exportPresets: ExportPreset[] = [
  { path: "expo/icon.png", size: 1024 },
  { path: "expo/adaptive-icon.png", size: 1024 },
  { path: "expo/splash-icon.png", size: 1024 },
  { path: "web/favicon-16x16.png", size: 16 },
  { path: "web/favicon-32x32.png", size: 32 },
  { path: "web/icon-192x192.png", size: 192 },
  { path: "web/icon-512x512.png", size: 512 },
  { path: "web/apple-touch-icon.png", size: 180 },
];

export const extraExportFiles = ["README.md", "icon-config.json"];

export const exportFileList = [
  ...exportPresets.map((p) => p.path),
  ...extraExportFiles,
];
