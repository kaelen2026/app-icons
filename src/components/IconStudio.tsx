"use client";

import { saveAs } from "file-saver";
import { useCallback, useEffect, useRef, useState } from "react";
import BackgroundPanel from "@/components/BackgroundPanel";
import ExportPanel from "@/components/ExportPanel";
import ForegroundPanel from "@/components/ForegroundPanel";
import IconPreview from "@/components/IconPreview";
import ShapePanel from "@/components/ShapePanel";
import TransformPanel from "@/components/TransformPanel";
import {
  loadStoredConfig,
  parseIconConfig,
  parsePlatformIds,
  saveStoredConfig,
} from "@/lib/configStorage";
import type { PlatformId } from "@/lib/exportPresets";
import { allPlatformIds, exportFileList } from "@/lib/exportPresets";
import { exportZip, zipFileName } from "@/lib/exportZip";
import type { IconConfig } from "@/types/icon";
import { defaultIconConfig } from "@/types/icon";

const MARK_STAGGER_MS = 70;

// Rendered with ssr:false (see app/page.tsx), so localStorage is readable in
// the lazy initializer and the stored design lands in the very first render.
export default function IconStudio() {
  const [config, setConfig] = useState<IconConfig>(
    () => loadStoredConfig() ?? defaultIconConfig,
  );
  const [exporting, setExporting] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PlatformId[]>(allPlatformIds);
  const [importError, setImportError] = useState<string | null>(null);
  const markTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveStoredConfig(config);
  }, [config]);

  const togglePlatform = useCallback((id: PlatformId) => {
    // filter against the registry so the selection keeps canonical order
    setSelected((prev) =>
      allPlatformIds.filter((p) =>
        p === id ? !prev.includes(p) : prev.includes(p),
      ),
    );
  }, []);

  const update = useCallback((patch: Partial<IconConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig(defaultIconConfig);
    setCompleted([]);
    setSaved(false);
    setImportError(null);
  }, []);

  const handleImportFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    try {
      const data: unknown = JSON.parse(await file.text());
      const parsed = parseIconConfig(data);
      if (!parsed) throw new Error("not an object");
      setConfig(parsed);
      // exported icon-config.json also records the platform selection
      const ids = parsePlatformIds(data);
      if (ids) setSelected(ids);
      setImportError(null);
    } catch {
      setImportError("not a valid icon-config.json");
    }
  }, []);

  const handleDownload = useCallback(async () => {
    setExporting(true);
    setSaved(false);
    setExportError(null);
    setCompleted([]);
    markTimers.current.forEach(clearTimeout);
    markTimers.current = [];

    const start = performance.now();
    let index = 0;
    try {
      const blob = await exportZip(config, selected, (path) => {
        // pace the checkmarks so each lands ≥ index * stagger after start
        const at = index * MARK_STAGGER_MS;
        index++;
        const delay = Math.max(0, at - (performance.now() - start));
        markTimers.current.push(
          setTimeout(() => setCompleted((prev) => [...prev, path]), delay),
        );
      });
      // let the last checkmarks land before the zip drops
      const lastMark = exportFileList(selected).length * MARK_STAGGER_MS;
      const remaining = Math.max(0, lastMark - (performance.now() - start));
      await new Promise((r) => setTimeout(r, remaining));
      saveAs(blob, zipFileName(config));
      setSaved(true);
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "export failed. retry.",
      );
    } finally {
      setExporting(false);
    }
  }, [config, selected]);

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:overflow-hidden">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-hairline px-5">
        <h1 className="text-sm text-text">
          app_icons{" "}
          <span className="text-[10px] text-text-faint">
            v0.1 · ios + android + web icon packs
          </span>
        </h1>
        <div className="flex items-center gap-2">
          {importError && (
            <span className="text-[11px] text-red-400">{importError}</span>
          )}
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              handleImportFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            title="restore a design from an exported icon-config.json"
            className="rounded-sm border border-hairline px-3 py-1.5 text-[11px] text-text-dim transition-all hover:border-hairline-bright hover:text-text active:scale-[0.97]"
          >
            import
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-sm border border-hairline px-3 py-1.5 text-[11px] text-text-dim transition-all hover:border-hairline-bright hover:text-text active:scale-[0.97]"
          >
            reset
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={exporting || selected.length === 0}
            className="rounded-sm bg-accent px-3 py-1.5 text-[11px] font-medium text-ink transition-all hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {exporting ? "rendering…" : "download .zip"}
          </button>
        </div>
      </header>

      <main className="grid flex-1 lg:min-h-0 lg:grid-cols-[300px_1fr_280px]">
        {/* left: controls */}
        <aside className="border-b border-hairline lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="divide-y divide-hairline">
            <section className="space-y-2 p-5">
              <h2 className="text-[11px] tracking-[0.18em] text-text-faint">
                app_name
              </h2>
              <input
                type="text"
                value={config.appName}
                onChange={(e) => update({ appName: e.target.value })}
                placeholder="my-app"
                className="w-full rounded-sm border border-hairline bg-panel-2 px-3 py-2 text-xs text-text outline-none transition-colors focus:border-accent"
              />
            </section>
            <div className="p-5">
              <ForegroundPanel config={config} onChange={update} />
            </div>
            <div className="p-5">
              <BackgroundPanel config={config} onChange={update} />
            </div>
            <div className="p-5">
              <ShapePanel config={config} onChange={update} />
            </div>
            <div className="p-5">
              <TransformPanel config={config} onChange={update} />
            </div>
          </div>
        </aside>

        {/* center: preview + context wall */}
        <section className="border-b border-hairline lg:min-h-0 lg:border-b-0">
          <IconPreview config={config} />
        </section>

        {/* right: manifest + export */}
        <aside className="lg:overflow-y-auto lg:border-l lg:border-hairline">
          <div className="p-5">
            <ExportPanel
              exporting={exporting}
              completed={completed}
              saved={saved}
              selected={selected}
              zipName={zipFileName(config)}
              onToggle={togglePlatform}
              onDownload={handleDownload}
            />
            {exportError && (
              <p className="mt-3 text-[11px] text-red-400">{exportError}</p>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
