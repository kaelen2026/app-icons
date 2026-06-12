"use client";

import { useState } from "react";
import { exportFileList, exportPresets } from "@/lib/exportPresets";

type Props = {
  exporting: boolean;
  onDownload: () => void;
};

export default function ExportPanel({ exporting, onDownload }: Props) {
  const [showFiles, setShowFiles] = useState(false);

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Export
      </h2>
      <p className="text-xs text-zinc-500">
        Expo + Web/PWA icon pack as <code>app-icons.zip</code>
      </p>
      <button
        type="button"
        onClick={onDownload}
        disabled={exporting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {exporting ? "Generating…" : "Download ZIP"}
      </button>
      <button
        type="button"
        onClick={() => setShowFiles((v) => !v)}
        className="w-full rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500"
      >
        {showFiles ? "Hide file list" : "File list"}
      </button>
      {showFiles && (
        <div className="space-y-1 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
          <ul className="space-y-0.5 font-mono text-[11px] text-zinc-400">
            {exportFileList.map((path) => {
              const preset = exportPresets.find((p) => p.path === path);
              return (
                <li key={path} className="flex justify-between gap-2">
                  <span>{path}</span>
                  {preset && (
                    <span className="text-zinc-600">
                      {preset.size}×{preset.size}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="pt-1 text-[11px] text-zinc-500">
            {exportFileList.length} files total
          </p>
        </div>
      )}
    </section>
  );
}
