"use client";

import { useRef, useState } from "react";

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

type Props = {
  imageSrc: string | null;
  onImageChange: (src: string | null) => void;
};

export default function ImageUploader({ imageSrc, onImageChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Unsupported file type. Use PNG, JPG, WebP or SVG.");
      return;
    }
    setError(null);
    if (imageSrc?.startsWith("blob:")) URL.revokeObjectURL(imageSrc);
    onImageChange(URL.createObjectURL(file));
  }

  function handleRemove() {
    if (imageSrc?.startsWith("blob:")) URL.revokeObjectURL(imageSrc);
    if (inputRef.current) inputRef.current.value = "";
    setError(null);
    onImageChange(null);
  }

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Image
      </h2>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-600 px-4 py-6 text-center transition-colors hover:border-zinc-400 hover:bg-zinc-800/50"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <span className="text-sm text-zinc-300">
          {imageSrc ? "Replace image" : "Click or drop an image"}
        </span>
        <span className="text-xs text-zinc-500">PNG · JPG · WebP · SVG</span>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {imageSrc && (
        <button
          type="button"
          onClick={handleRemove}
          className="w-full rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-red-500/60 hover:text-red-400"
        >
          Remove image
        </button>
      )}
    </section>
  );
}
