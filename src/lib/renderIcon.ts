import type { IconConfig, IconShape, TextFont } from "@/types/icon";
import { lucideSvgDataUrl } from "./lucide";

export type RenderVariant =
  | "masked" // shape clip + background + foreground (preview / default)
  | "fullBleed" // square, no clip — for targets that apply their own mask (iOS, Play Store)
  | "adaptiveForeground" // transparent bg, foreground in the Android 66/108dp safe zone
  | "adaptiveBackground" // background layer only, full bleed
  | "maskable" // full bleed, foreground in the PWA 80% safe zone
  | "harmonyForeground"; // transparent bg, foreground in the HarmonyOS 672/1024px safe zone

type VariantSpec = {
  clip: boolean;
  background: boolean;
  foreground: boolean;
  fgScale: number;
};

const VARIANTS: Record<RenderVariant, VariantSpec> = {
  masked: { clip: true, background: true, foreground: true, fgScale: 1 },
  fullBleed: { clip: false, background: true, foreground: true, fgScale: 1 },
  adaptiveForeground: {
    clip: false,
    background: false,
    foreground: true,
    fgScale: 66 / 108,
  },
  adaptiveBackground: {
    clip: false,
    background: true,
    foreground: false,
    fgScale: 1,
  },
  maskable: { clip: false, background: true, foreground: true, fgScale: 0.8 },
  harmonyForeground: {
    clip: false,
    background: false,
    foreground: true,
    fgScale: 672 / 1024,
  },
};

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Crude cap: icon recolors generate many data-URL entries
      if (imageCache.size > 100) imageCache.clear();
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function traceShapePath(
  ctx: CanvasRenderingContext2D,
  shape: IconShape,
  size: number,
) {
  const half = size / 2;
  ctx.beginPath();
  switch (shape) {
    case "square":
      ctx.rect(0, 0, size, size);
      break;
    case "rounded": {
      // iOS-style corner radius (~22.5% of size)
      const r = size * 0.225;
      ctx.roundRect(0, 0, size, size, r);
      break;
    }
    case "circle":
      ctx.arc(half, half, half, 0, Math.PI * 2);
      break;
    case "squircle": {
      // Superellipse |x|^n + |y|^n = r^n with n = 5
      const n = 5;
      const steps = 128;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const cos = Math.cos(t);
        const sin = Math.sin(t);
        const x = half + half * Math.sign(cos) * Math.abs(cos) ** (2 / n);
        const y = half + half * Math.sign(sin) * Math.abs(sin) ** (2 / n);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }
  }
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  config: IconConfig,
  size: number,
) {
  if (config.bgType === "linear") {
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, config.bgColor1);
    gradient.addColorStop(1, config.bgColor2);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = config.bgColor1;
  }
  ctx.fillRect(0, 0, size, size);
}

/** Translate to icon center (with offset) and apply rotation; caller must save/restore. */
function applyTransform(
  ctx: CanvasRenderingContext2D,
  config: IconConfig,
  size: number,
) {
  // offset range -100..100 maps to -size/2..size/2
  const dx = (config.offsetX / 100) * (size / 2);
  const dy = (config.offsetY / 100) * (size / 2);
  ctx.translate(size / 2 + dx, size / 2 + dy);
  ctx.rotate((config.rotation * Math.PI) / 180);
}

function drawImageForeground(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  config: IconConfig,
  size: number,
) {
  const naturalW = img.naturalWidth || size;
  const naturalH = img.naturalHeight || size;
  // scale = percentage of canvas the image's larger dimension occupies
  const target = (config.scale / 100) * size;
  const ratio = target / Math.max(naturalW, naturalH);
  const drawW = naturalW * ratio;
  const drawH = naturalH * ratio;

  ctx.save();
  applyTransform(ctx, config, size);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

const FONT_STACKS: Record<TextFont, string> = {
  sans: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "Menlo, Consolas, 'Liberation Mono', monospace",
};

function drawTextForeground(
  ctx: CanvasRenderingContext2D,
  config: IconConfig,
  size: number,
) {
  const text = config.text.trim();
  if (!text) return;
  const target = (config.scale / 100) * size;
  const family = FONT_STACKS[config.textFont];

  // Start with font size = target box, shrink to fit width if needed
  let fontSize = target;
  ctx.font = `700 ${fontSize}px ${family}`;
  const width = ctx.measureText(text).width;
  if (width > target) {
    fontSize *= target / width;
  }

  ctx.save();
  applyTransform(ctx, config, size);
  ctx.font = `700 ${fontSize}px ${family}`;
  ctx.fillStyle = config.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  // Optically center using the actual glyph bounding box
  const metrics = ctx.measureText(text);
  const yOffset =
    (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
  ctx.fillText(text, 0, yOffset);
  ctx.restore();
}

async function drawForeground(
  ctx: CanvasRenderingContext2D,
  config: IconConfig,
  size: number,
) {
  if (config.fgMode === "text") {
    drawTextForeground(ctx, config, size);
    return;
  }

  let src: string | null = null;
  if (config.fgMode === "image") {
    src = config.imageSrc;
  } else {
    src = lucideSvgDataUrl(config.iconName, config.iconColor);
  }
  if (!src) return;

  try {
    const img = await loadImage(src);
    drawImageForeground(ctx, img, config, size);
  } catch {
    // Background still renders if the foreground fails to load
  }
}

/**
 * Draws the full icon (mask + background + image) onto an existing 2D context.
 * Shared by the live preview canvas and the offscreen export renderer.
 */
export async function drawIcon(
  ctx: CanvasRenderingContext2D,
  config: IconConfig,
  size: number,
  variant: RenderVariant = "masked",
): Promise<void> {
  const spec = VARIANTS[variant];
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  if (spec.clip) {
    traceShapePath(ctx, config.shape, size);
    ctx.clip();
  }
  if (spec.background) drawBackground(ctx, config, size);
  if (spec.foreground) {
    // Shrink scale AND offsets so the composition stays inside the safe zone
    const fgConfig: IconConfig =
      spec.fgScale === 1
        ? config
        : {
            ...config,
            scale: config.scale * spec.fgScale,
            offsetX: config.offsetX * spec.fgScale,
            offsetY: config.offsetY * spec.fgScale,
          };
    await drawForeground(ctx, fgConfig, size);
  }
  ctx.restore();
}

/** Small renders for the context preview wall (returns a data URL for <img>). */
export async function renderIconDataUrl(
  config: IconConfig,
  size: number,
  variant: RenderVariant = "masked",
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  await drawIcon(ctx, config, size, variant);
  return canvas.toDataURL("image/png");
}

export async function renderIcon(
  config: IconConfig,
  size: number,
  variant: RenderVariant = "masked",
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  await drawIcon(ctx, config, size, variant);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to encode PNG"));
    }, "image/png");
  });
}
