"use client";

import { useMemo, useState } from "react";
import type { ForegroundMode, IconConfig, TextFont } from "@/types/icon";
import { lucideIconNames, lucideSvgDataUrl, toKebab } from "@/lib/lucide";
import ImageUploader from "./ImageUploader";

const MODES: { value: ForegroundMode; label: string }[] = [
  { value: "image", label: "Image" },
  { value: "text", label: "Text" },
  { value: "icon", label: "Icon" },
];

const FONTS: { value: TextFont; label: string }[] = [
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
];

const POPULAR_ICONS = [
  "Rocket",
  "Zap",
  "Star",
  "Heart",
  "Flame",
  "Sparkles",
  "Camera",
  "Music",
  "MessageCircle",
  "ShoppingCart",
  "Gamepad2",
  "BookOpen",
  "Cloud",
  "Code",
  "Compass",
  "Globe",
  "Leaf",
  "Coffee",
  "Dumbbell",
  "Wallet",
  "Bell",
  "Calendar",
  "MapPin",
  "Send",
];

const GRID_LIMIT = 24;

type Props = {
  config: IconConfig;
  onChange: (patch: Partial<IconConfig>) => void;
};

export default function ForegroundPanel({ config, onChange }: Props) {
  const [query, setQuery] = useState("");

  const visibleIcons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POPULAR_ICONS;
    return lucideIconNames
      .filter((name) => toKebab(name).includes(q))
      .slice(0, GRID_LIMIT);
  }, [query]);

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Foreground
      </h2>
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-800 p-1">
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange({ fgMode: mode.value })}
            className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
              config.fgMode === mode.value
                ? "bg-zinc-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {config.fgMode === "image" && (
        <ImageUploader
          imageSrc={config.imageSrc}
          onImageChange={(src) => onChange({ imageSrc: src })}
        />
      )}

      {config.fgMode === "text" && (
        <div className="space-y-3">
          <input
            type="text"
            value={config.text}
            maxLength={12}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="A"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500"
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-zinc-300">
              <input
                type="color"
                value={config.textColor}
                onChange={(e) => onChange({ textColor: e.target.value })}
                className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
              />
              Color
            </label>
            <div className="grid flex-1 grid-cols-3 gap-1 rounded-lg bg-zinc-800 p-1">
              {FONTS.map((font) => (
                <button
                  key={font.value}
                  type="button"
                  onClick={() => onChange({ textFont: font.value })}
                  className={`rounded-md px-2 py-1 text-xs transition-colors ${
                    config.textFont === font.value
                      ? "bg-zinc-600 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {config.fgMode === "icon" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 1900+ icons…"
              className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500"
            />
            <label className="flex items-center gap-2 text-xs text-zinc-300">
              <input
                type="color"
                value={config.iconColor}
                onChange={(e) => onChange({ iconColor: e.target.value })}
                className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
              />
            </label>
          </div>
          {visibleIcons.length === 0 ? (
            <p className="text-xs text-zinc-500">No icons match “{query}”.</p>
          ) : (
            <div className="grid grid-cols-6 gap-1.5">
              {visibleIcons.map((name) => {
                const src = lucideSvgDataUrl(name, "#d4d4d8");
                if (!src) return null;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onChange({ iconName: name })}
                    title={toKebab(name)}
                    className={`flex aspect-square items-center justify-center rounded-md border p-1.5 transition-colors ${
                      config.iconName === name
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={toKebab(name)} className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          )}
          <p className="text-[11px] text-zinc-500">
            Selected: <span className="text-zinc-300">{toKebab(config.iconName)}</span>
          </p>
        </div>
      )}
    </section>
  );
}
