import type { IconConfig } from "@/types/icon";
import { defaultIconConfig } from "@/types/icon";
import type { PlatformId } from "./exportPresets";
import { allPlatformIds } from "./exportPresets";
import { lucideIconNames } from "./lucide";

const STORAGE_KEY = "app-icons:config";

const FG_MODES = ["image", "text", "icon", "emoji"] as const;
const FONTS = ["sans", "serif", "mono"] as const;
const BG_TYPES = ["solid", "linear", "radial"] as const;
const SHAPES = ["rounded", "circle", "squircle", "square"] as const;

function pickString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function pickEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function pickNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

function pickColor(value: unknown, fallback: string): string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)
    ? value
    : fallback;
}

/**
 * Coerce untrusted JSON (localStorage or an imported icon-config.json) into a
 * valid IconConfig. Unknown fields are dropped, bad values fall back to
 * defaults, numbers are clamped to the slider ranges.
 */
export function parseIconConfig(data: unknown): IconConfig | null {
  if (typeof data !== "object" || data === null || Array.isArray(data))
    return null;
  const d = data as Record<string, unknown>;
  const def = defaultIconConfig;
  // Require at least one recognizable field, so importing an unrelated JSON
  // file fails loudly instead of silently resetting the design to defaults
  if (!Object.keys(def).some((key) => key in d)) return null;
  return {
    fgMode: pickEnum(d.fgMode, FG_MODES, def.fgMode),
    // blob: URLs are session-bound; only persisted data URLs survive a reload
    imageSrc:
      typeof d.imageSrc === "string" && d.imageSrc.startsWith("data:image/")
        ? d.imageSrc
        : null,
    text: pickString(d.text, def.text).slice(0, 12),
    textColor: pickColor(d.textColor, def.textColor),
    textFont: pickEnum(d.textFont, FONTS, def.textFont),
    iconName:
      typeof d.iconName === "string" && lucideIconNames.includes(d.iconName)
        ? d.iconName
        : def.iconName,
    iconColor: pickColor(d.iconColor, def.iconColor),
    iconStroke: pickNumber(d.iconStroke, 1, 3, def.iconStroke),
    // a single emoji can be several code points (ZWJ sequences, flags)
    emoji: pickString(d.emoji, def.emoji).slice(0, 16),
    appName: pickString(d.appName, def.appName),
    bgType: pickEnum(d.bgType, BG_TYPES, def.bgType),
    bgAngle: pickNumber(d.bgAngle, 0, 360, def.bgAngle),
    bgColor1: pickColor(d.bgColor1, def.bgColor1),
    bgColor2: pickColor(d.bgColor2, def.bgColor2),
    shape: pickEnum(d.shape, SHAPES, def.shape),
    scale: pickNumber(d.scale, 20, 120, def.scale),
    offsetX: pickNumber(d.offsetX, -100, 100, def.offsetX),
    offsetY: pickNumber(d.offsetY, -100, 100, def.offsetY),
    rotation: pickNumber(d.rotation, -180, 180, def.rotation),
  };
}

/** Platform selection from an exported icon-config.json, if present and valid. */
export function parsePlatformIds(data: unknown): PlatformId[] | null {
  if (typeof data !== "object" || data === null) return null;
  const raw = (data as Record<string, unknown>).platforms;
  if (!Array.isArray(raw)) return null;
  const ids = allPlatformIds.filter((id) => raw.includes(id));
  return ids.length > 0 ? ids : null;
}

export function loadStoredConfig(): IconConfig | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseIconConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveStoredConfig(config: IconConfig): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Quota overflow — usually a large image data URL. Keep the rest.
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...config, imageSrc: null }),
      );
    } catch {
      // Private mode / storage disabled: persistence is best-effort.
    }
  }
}
