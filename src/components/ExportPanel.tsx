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
  onDownload,
}: Props) {
  const fileList = exportFileList(selected);
  const none = selected.length === 0;

  return (
    <section className="space-y-4">
      <h2 className="text-[11px] tracking-[0.18em] text-text-faint">
        platforms
      </h2>
      <ul className="space-y-1.5">
        {platforms.map((platform) => {
          const checked = selected.includes(platform.id);
          const count =
            platform.files.length +
            (platform.icoFiles?.length ?? 0) +
            (platform.staticFiles?.length ?? 0);
          return (
            <li key={platform.id}>
              <label className="flex cursor-pointer items-baseline gap-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={exporting}
                  onChange={() => onToggle(platform.id)}
                  className="relative top-px size-3 accent-[var(--color-accent,#4ade80)]"
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
        className="w-full rounded-sm bg-accent px-4 py-2 text-xs font-medium text-ink transition-all hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {exporting ? "rendering…" : "download .zip"}
      </button>
    </section>
  );
}
