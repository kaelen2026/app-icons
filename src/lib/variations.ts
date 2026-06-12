import type { IconConfig, IconShape } from "@/types/icon";
import { popularIconNames } from "./lucide";
import { presetPatch, stylePresets } from "./presets";

export type ConfigVariation = {
  id: string;
  label: string;
  config: IconConfig;
};

const SHAPES: IconShape[] = ["rounded", "squircle", "circle", "square"];

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

function presetIndexFor(config: IconConfig): number {
  const index = stylePresets.findIndex(
    (preset) =>
      preset.patch.bgType === config.bgType &&
      preset.patch.bgColor1 === config.bgColor1 &&
      preset.patch.bgColor2 === config.bgColor2,
  );
  return index === -1 ? 0 : index;
}

function iconIndexFor(config: IconConfig): number {
  const index = popularIconNames.indexOf(config.iconName);
  return index === -1 ? 0 : index;
}

function withPatch(
  config: IconConfig,
  id: string,
  label: string,
  patch: Partial<IconConfig>,
): ConfigVariation {
  return {
    id,
    label,
    config: {
      ...config,
      ...patch,
    },
  };
}

export function generateConfigVariations(
  config: IconConfig,
): ConfigVariation[] {
  const presetIndex = presetIndexFor(config);
  const iconIndex = iconIndexFor(config);
  const currentShapeIndex = SHAPES.indexOf(config.shape);
  const nextShape = SHAPES[wrapIndex(currentShapeIndex + 1, SHAPES.length)];
  const altShape = SHAPES[wrapIndex(currentShapeIndex + 2, SHAPES.length)];

  const calmPreset =
    stylePresets[wrapIndex(presetIndex + 1, stylePresets.length)];
  const boldPreset =
    stylePresets[wrapIndex(presetIndex + 3, stylePresets.length)];
  const lightPreset =
    stylePresets.find((preset) => preset.name === "paper") ??
    stylePresets[wrapIndex(presetIndex + 5, stylePresets.length)];

  return [
    withPatch(config, "color-calm", "calm", presetPatch(calmPreset)),
    withPatch(config, "color-bold", "bold", presetPatch(boldPreset)),
    withPatch(config, "light", "light", presetPatch(lightPreset)),
    withPatch(config, "shape-next", nextShape, { shape: nextShape }),
    withPatch(config, "compact", "compact", {
      scale: Math.max(36, Math.round(config.scale * 0.82)),
      shape: altShape,
    }),
    withPatch(config, "icon-swap", "swap icon", {
      fgMode: "icon",
      iconName:
        popularIconNames[wrapIndex(iconIndex + 7, popularIconNames.length)],
    }),
  ];
}
