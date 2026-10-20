// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GH_PAGES=1 builds a static site served from /got/ (GitHub Pages at liveharshit.in/got).
const ghPages = process.env.GH_PAGES === "1";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(ghPages
      ? {
          router: { basepath: "/got" },
          spa: { enabled: true, prerender: { outputPath: "/index.html", crawlLinks: false } },
        }
      : {}),
  },
  ...(ghPages ? { vite: { base: "/got/" } } : {}),
});
