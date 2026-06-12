"use client";

import { useEffect, useRef } from "react";
import type { IconConfig } from "@/types/icon";
import { drawIcon } from "@/lib/renderIcon";

const LOGICAL_SIZE = 1024;

type Props = {
  config: IconConfig;
};

export default function IconPreview({ config }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;
    // drawIcon clears and repaints; guard against out-of-order async paints
    drawIcon(ctx, config, LOGICAL_SIZE).then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [config]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-full max-w-[480px] rounded-2xl p-6"
        style={{
          backgroundImage:
            "repeating-conic-gradient(#27272a 0% 25%, #18181b 0% 50%)",
          backgroundSize: "24px 24px",
        }}
      >
        <canvas
          ref={canvasRef}
          width={LOGICAL_SIZE}
          height={LOGICAL_SIZE}
          className="h-auto w-full"
        />
      </div>
      <p className="text-xs text-zinc-500">1024 × 1024 px · live render</p>
    </div>
  );
}
