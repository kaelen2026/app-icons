"use client";

import type { PlatformId } from "@/lib/exportPresets";
import {
  exportFileList,
  extraExportFiles,
  platforms,
  sizeForPath,
} from "@/lib/exportPresets";

type Props = {
  exporting: boolean;
  completed: string[];
  saved: boolean;
  selected: PlatformId[];
  zipName: string;
  onToggle: (id: PlatformId) => void;
  onSelectAll: (all: boolean) => void;
  onDownload: () => void;
};

function FileRow({
  path,
  label,
  done,
}: {
  path: string;
  label: string;
  done: boolean;
}) {
  const size = sizeForPath(path);
  return (
    <li className="flex items-center gap-2">
      <span
        className={`w-3 text-center transition-colors duration-150 ${
          done ? "text-accent" : "text-text-faint"
        }`}
      >
        {done ? "✓" : "·"}
      </span>
      <span
        className={`min-w-0 flex-1 truncate transition-colors duration-150 ${
          done ? "text-text" : "text-text-dim"
        }`}
      >
        {label}
      </span>
      {size !== null && (
        <span className="tabular-nums text-text-faint">{size}</span>
      )}
    </li>
  );
}

export default function ExportPanel({
  exporting,
  completed,
  saved,
  selected,
  zipName,
  onToggle,
  onSelectAll,
  onDownload,
}: Props) {
  const fileList = exportFileList(selected);
  const none = selected.length === 0;
  const allSelected = selected.length === platforms.length;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[11px] tracking-[0.18em] text-text-faint">
          platforms
        </h2>
        <button
          type="button"
          disabled={exporting}
          onClick={() => onSelectAll(!allSelected)}
          className="min-h-11 text-[11px] text-text-dim transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0"
        >
          {allSelected ? "clear all" : "select all"}
        </button>
      </div>
      <ul className="space-y-1.5">
        {platforms.map((platform) => {
          const checked = selected.includes(platform.id);
          const count =
            platform.files.length +
            (platform.icoFiles?.length ?? 0) +
            (platform.staticFiles?.length ?? 0);
          return (
            <li key={platform.id}>
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[11px] sm:min-h-0 sm:items-baseline">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={exporting}
                  onChange={() => onToggle(platform.id)}
                  className="size-4 accent-accent sm:relative sm:top-px sm:size-3"
                />
                <span className={checked ? "text-text" : "text-text-dim"}>
                  {platform.label}
                </span>
                <span className="min-w-0 flex-1 truncate text-text-faint">
                  {platform.description}
                </span>
                <span className="tabular-nums text-text-faint">{count}</span>
              </label>
            </li>
          );
        })}
      </ul>

      <h2 className="border-t border-hairline pt-3 text-[11px] tracking-[0.18em] text-text-faint">
        manifest
      </h2>
      <div className="space-y-2 text-[11px]">
        {platforms
          .filter((p) => selected.includes(p.id))
          .map((platform) => {
            const paths = [
              ...platform.files.map((f) => f.path),
              ...(platform.icoFiles ?? []).map((f) => f.path),
              ...(platform.staticFiles ?? []).map((f) => f.path),
            ];
            return (
              <div key={platform.id}>
                <p className="pb-0.5 text-text-faint">{platform.id}/</p>
                <ul className="space-y-0.5">
                  {paths.map((path) => (
                    <FileRow
                      key={path}
                      path={path}
                      label={path.slice(platform.id.length + 1)}
                      done={completed.includes(path)}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        {!none && (
          <ul className="space-y-0.5">
            {extraExportFiles.map((path) => (
              <FileRow
                key={path}
                path={path}
                label={path}
                done={completed.includes(path)}
              />
            ))}
          </ul>
        )}
      </div>

      <p className="border-t border-hairline pt-3 text-[11px] text-text-faint">
        {saved ? (
          <span className="text-accent">{zipName} ✓ saved</span>
        ) : exporting ? (
          `rendering ${completed.length}/${fileList.length}…`
        ) : none ? (
          "no platforms selected"
        ) : (
          `${fileList.length} files · ${selected.join(" + ")}`
        )}
      </p>
      <button
        type="button"
        onClick={onDownload}
        disabled={exporting || none}
        className="min-h-12 w-full rounded-sm bg-accent px-4 py-2 text-xs font-medium text-ink transition-all hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0"
      >
        {exporting ? "rendering…" : "download .zip"}
      </button>
    </section>
  );
}
