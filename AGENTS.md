<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```sh
pnpm dev        # dev server at localhost:3000
pnpm lint       # eslint .
pnpm typecheck  # tsc --noEmit
pnpm build      # next build
```

## Verification

There is no automated test suite yet; lint + typecheck + build is the verification gate. After any code change, all of these must pass:

```sh
pnpm lint && pnpm typecheck && pnpm build
```

## Project architecture

Browser-only app icon generator: compose a foreground (image upload, text, or Lucide icon) over a background and shape, preview live, export a multi-platform ZIP. No backend, no database — everything renders client-side with the Canvas API.

The whole app derives from one state object:

- **`IconConfig`** (`src/types/icon.ts`) — the single source of design state. `src/app/page.tsx` owns it in a `useState` and hands every panel an `update(patch)` callback; panels never hold their own copies.
- **`drawIcon()`** (`src/lib/renderIcon.ts`) — the rendering core, shared by the live preview canvas and the offscreen export renderer. The key concept is **`RenderVariant`**: the same config renders differently per target (`masked` for previews, `fullBleed` for iOS/Play Store which apply their own mask, `adaptiveForeground`/`adaptiveBackground` for Android adaptive layers, `maskable` for PWA). Each variant declares clip/background/foreground flags plus an `fgScale` that shrinks the composition into that platform's safe zone. New platform requirements usually mean a new variant here, not a new renderer.
- **Platform registry** (`src/lib/exportPresets.ts`) — declarative list of platforms, each with rendered files (`{path, size, variant}`), optional static files (Contents.json, adaptive-icon XML, web manifest), and a README section. The export panel UI, the file-list preview, and the ZIP contents all derive from this registry — adding an export target means adding an entry here, nothing else.
- **`exportZip()`** (`src/lib/exportZip.ts`) — walks the registry for selected platforms, renders each file through `renderIcon`, and packages everything with JSZip plus a generated README and `icon-config.json` snapshot.
- **`src/lib/lucide.ts`** — turns Lucide icon nodes into recolored SVG data URLs that feed the image-drawing path in the renderer.

`docs/superpowers/specs/` holds design specs (e.g. the multi-platform export design).

## Boundaries

Everything runs client-side in the browser. Do not add server routes, API handlers, databases, or auth.
