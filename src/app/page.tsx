"use client";

import { useCallback, useState } from "react";
import { saveAs } from "file-saver";
import type { IconConfig } from "@/types/icon";
import { defaultIconConfig } from "@/types/icon";
import { exportZip } from "@/lib/exportZip";
import ForegroundPanel from "@/components/ForegroundPanel";
import IconPreview from "@/components/IconPreview";
import BackgroundPanel from "@/components/BackgroundPanel";
import ShapePanel from "@/components/ShapePanel";
import TransformPanel from "@/components/TransformPanel";
import ExportPanel from "@/components/ExportPanel";

export default function Home() {
  const [config, setConfig] = useState<IconConfig>(defaultIconConfig);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const update = useCallback((patch: Partial<IconConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig((prev) => {
      if (prev.imageSrc?.startsWith("blob:")) {
        URL.revokeObjectURL(prev.imageSrc);
      }
      return defaultIconConfig;
    });
  }, []);

  const handleDownload = useCallback(async () => {
    setExporting(true);
    setExportError(null);
    try {
      const blob = await exportZip(config);
      saveAs(blob, "app-icons.zip");
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Export failed. Please retry."
      );
    } finally {
      setExporting(false);
    }
  }, [config]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
        <h1 className="text-sm font-semibold tracking-tight">
          App Icon Generator
          <span className="ml-2 text-xs font-normal text-zinc-500">
            Expo · PWA · Web
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-500"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={exporting}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting ? "Generating…" : "Download ZIP"}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-[280px_1fr_260px]">
        {/* Left: controls */}
        <aside className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              App name
            </h2>
            <input
              type="text"
              value={config.appName}
              onChange={(e) => update({ appName: e.target.value })}
              placeholder="My App"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500"
            />
          </section>
          <ForegroundPanel config={config} onChange={update} />
          <BackgroundPanel config={config} onChange={update} />
          <ShapePanel config={config} onChange={update} />
          <TransformPanel config={config} onChange={update} />
        </aside>

        {/* Center: preview */}
        <section className="flex items-start justify-center pt-4">
          <IconPreview config={config} />
        </section>

        {/* Right: export */}
        <aside className="h-fit space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <ExportPanel exporting={exporting} onDownload={handleDownload} />
          {exportError && (
            <p className="text-xs text-red-400">{exportError}</p>
          )}
        </aside>
      </main>
    </div>
  );
}
