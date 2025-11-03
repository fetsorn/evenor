import solidPlugin from "vite-plugin-solid";
import { defineConfig } from "vite";
import { dirname, resolve } from "path";
import { webdriverio } from "@vitest/browser-webdriverio";
import { env } from "process";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
// wdio breaks with vite-plugin-node-polyfills
// import { nodePolyfills } from "vite-plugin-node-polyfills";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const commitHash = execSync("git rev-parse --short HEAD")
  .toString()
  .replace("\n", "");
const host = env.TAURI_DEV_HOST;

function getBuildMode() {
  if (env.BUILD_MODE) {
    return env.BUILD_MODE;
  }

  const platform = env.TAURI_ENV_PLATFORM ?? "browser";

  return platform;
}

export default defineConfig({
  plugins: [solidPlugin()],
  publicDir: "public",
  optimizeDeps: {
    exclude: ["classnames", "js-sha256"],
  },
  build: {
    outDir: "dist",
    target: "chrome83",
    minify: false,
    terserOptions: { compress: false, mangle: false },
  },
  envPrefix: ["VITE_", "TAURI_"],
  server: {
    host: host || false,
    port: 1420,
    strictPort: true,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1430,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  clearScreen: false,
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src/"),
      path: "path-browserify",
    },
  },
  define: {
    global: "globalThis",
    __BUILD_MODE__: JSON.stringify(getBuildMode()),
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  test: {
    include: ["./src/**/*test*"],
    exclude: ["./src/test/*", "./src-tauri"],
    setupFiles: ["./src/test/setup.js"],
    coverage: {
      provider: "istanbul",
      exclude: ["./src-tauri"],
      coverage: {
        reporter: ["text", "json", "html"],
      },
    },
    browser: {
      provider: webdriverio(),
      enabled: true,
      instances: [
        {
          browser: "firefox",
        },
      ],
    },
  },
});
