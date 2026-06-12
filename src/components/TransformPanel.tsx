"use client";

import type { IconConfig } from "@/types/icon";
import { defaultIconConfig } from "@/types/icon";

type SliderKey = "scale" | "offsetX" | "offsetY" | "rotation";

const SLIDERS: { key: SliderKey; label: string; min: number; max: number }[] = [
  { key: "scale", label: "Scale", min: 20, max: 120 },
  { key: "offsetX", label: "Offset X", min: -100, max: 100 },
  { key: "offsetY", label: "Offset Y", min: -100, max: 100 },
  { key: "rotation", label: "Rotation", min: -180, max: 180 },
];

type Props = {
  config: IconConfig;
  onChange: (patch: Partial<IconConfig>) => void;
};

export default function TransformPanel({ config, onChange }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Transform
        </h2>
        <button
          type="button"
          onClick={() =>
            onChange({
              scale: defaultIconConfig.scale,
              offsetX: defaultIconConfig.offsetX,
              offsetY: defaultIconConfig.offsetY,
              rotation: defaultIconConfig.rotation,
            })
          }
          className="text-xs text-zinc-500 transition-colors hover:text-zinc-200"
        >
          Reset
        </button>
      </div>
      {SLIDERS.map((slider) => (
        <label key={slider.key} className="block space-y-1">
          <span className="flex justify-between text-xs text-zinc-400">
            <span>{slider.label}</span>
            <span className="tabular-nums text-zinc-500">
              {config[slider.key]}
            </span>
          </span>
          <input
            type="range"
            min={slider.min}
            max={slider.max}
            value={config[slider.key]}
            onChange={(e) =>
              onChange({ [slider.key]: Number(e.target.value) })
            }
            className="w-full accent-indigo-500"
          />
        </label>
      ))}
    </section>
  );
}
