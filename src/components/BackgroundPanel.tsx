"use client";

import type { IconConfig } from "@/types/icon";

type Props = {
  config: IconConfig;
  onChange: (patch: Partial<IconConfig>) => void;
};

export default function BackgroundPanel({ config, onChange }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Background
      </h2>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-800 p-1">
        {(["solid", "linear"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange({ bgType: type })}
            className={`rounded-md px-3 py-1.5 text-xs capitalize transition-colors ${
              config.bgType === type
                ? "bg-zinc-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <label className="flex flex-1 items-center gap-2 text-xs text-zinc-300">
          <input
            type="color"
            value={config.bgColor1}
            onChange={(e) => onChange({ bgColor1: e.target.value })}
            className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
          />
          Color 1
        </label>
        <label
          className={`flex flex-1 items-center gap-2 text-xs text-zinc-300 ${
            config.bgType === "solid" ? "pointer-events-none opacity-40" : ""
          }`}
        >
          <input
            type="color"
            value={config.bgColor2}
            onChange={(e) => onChange({ bgColor2: e.target.value })}
            className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
            disabled={config.bgType === "solid"}
          />
          Color 2
        </label>
      </div>
    </section>
  );
}
