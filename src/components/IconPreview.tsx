"use client";

import { useEffect, useRef } from "react";
import type { IconConfig } from "@/types/icon";
import { drawIcon } from "@/lib/renderIcon";
import PreviewWall from "./PreviewWall";

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
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-8 py-8">
        <div
          className="flex aspect-square max-h-[26rem] w-full min-h-0 max-w-105 items-center justify-center border border-hairline p-5 lg:w-auto lg:max-w-full lg:flex-1"
          style={{
            backgroundImage:
              "repeating-conic-gradient(#131316 0% 25%, #0e0e10 0% 50%)",
            backgroundSize: "16px 16px",
          }}
        >
          <canvas
            ref={canvasRef}
            width={LOGICAL_SIZE}
            height={LOGICAL_SIZE}
            className="max-h-full max-w-full"
          />
        </div>
        <p className="shrink-0 text-[11px] tracking-[0.12em] text-text-faint">
          1024 × 1024 · live render
        </p>
      </div>
      <div className="shrink-0 border-t border-hairline">
        <PreviewWall config={config} />
      </div>
    </div>
  );
}
