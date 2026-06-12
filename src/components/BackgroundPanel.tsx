"use client";

import type { IconConfig } from "@/types/icon";

type Props = {
  config: IconConfig;
  onChange: (patch: Partial<IconConfig>) => void;
};

export default function BackgroundPanel({ config, onChange }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-[11px] tracking-[0.18em] text-text-faint">
        background
      </h2>
      <div className="grid grid-cols-2 gap-px border border-hairline bg-hairline">
        {(["solid", "linear"] as const).map((type) => {
          const active = config.bgType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ bgType: type })}
              className={`px-3 py-1.5 text-[11px] transition-colors ${
                active
                  ? "bg-panel-2 text-accent"
                  : "bg-ink text-text-dim hover:text-text"
              }`}
            >
              {active ? `> ${type}` : type}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-[11px] text-text-dim">
          <input
            type="color"
            value={config.bgColor1}
            onChange={(e) => onChange({ bgColor1: e.target.value })}
            className="h-7 w-7"
          />
          color_1
        </label>
        <label
          className={`flex items-center gap-2 text-[11px] text-text-dim ${
            config.bgType === "solid" ? "pointer-events-none opacity-30" : ""
          }`}
        >
          <input
            type="color"
            value={config.bgColor2}
            onChange={(e) => onChange({ bgColor2: e.target.value })}
            className="h-7 w-7"
            disabled={config.bgType === "solid"}
          />
          color_2
        </label>
      </div>
    </section>
  );
}
