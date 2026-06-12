"use client";

import type { IconConfig, IconShape } from "@/types/icon";

const SHAPES: { value: IconShape; label: string; radiusClass: string }[] = [
  { value: "square", label: "Square", radiusClass: "rounded-sm" },
  { value: "rounded", label: "Rounded", radiusClass: "rounded-lg" },
  { value: "circle", label: "Circle", radiusClass: "rounded-full" },
  { value: "squircle", label: "Squircle", radiusClass: "rounded-[38%]" },
];

type Props = {
  config: IconConfig;
  onChange: (patch: Partial<IconConfig>) => void;
};

export default function ShapePanel({ config, onChange }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Shape
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {SHAPES.map((shape) => (
          <button
            key={shape.value}
            type="button"
            onClick={() => onChange({ shape: shape.value })}
            className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors ${
              config.shape === shape.value
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-zinc-700 hover:border-zinc-500"
            }`}
            title={shape.label}
          >
            <span
              className={`h-7 w-7 bg-zinc-400 ${shape.radiusClass}`}
              aria-hidden
            />
            <span className="text-[10px] text-zinc-400">{shape.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
