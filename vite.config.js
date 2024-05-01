import path from "path";
import process from "process";
import { defineConfig } from "vite";
import { internalIpV4 } from "internal-ip";
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

function getBuildMode() {
  if (process.env.BUILD_MODE) {
    return process.env.BUILD_MODE
  }

  const isTauri = process.env.TAURI_ENV_ARCH != undefined;

  if (isTauri) {
    return "tauri"
  }

  return "browser"
}


// https://vitejs.dev/config/
export default defineConfig(async () => {
  const host = await internalIpV4();

  /** @type {import('vite').UserConfig} */
  const config = {
    build: {
      target: 'safari13',
    },
    worker: {
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        }
      }
    },
    plugins: [react({
      presets: [
        [ "@babel/preset-env", { targets: "safari13", useBuiltins: "entry", corejs: "3.36"
                               } ],
        "@babel/preset-react"
      ],
      // Use .babelrc files
      babelrc: false,
      // Use babel.config.js files
      configFile: false,
    }), nodePolyfills()],

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    // server: {
    //   port: 1420,
    //   strictPort: true,
    // },
    server: {
      host: "0.0.0.0", // listen on all addresses
      port: 1420,
      strictPort: true,
      hmr: {
        protocol: "ws",
        // TODO: replace with internalIpV4, why is it 192.168.1.0 but tauri connects to 192.168.1.4?
        host: "192.168.1.4",
        port: 1420,
      },
    },
    // TODO: check for build, https://github.com/vitejs/vite/issues/8427
    // https://github.com/vitejs/vite/issues/11672
    // optimizeDeps: { exclude: {} },
    // 3. to make use of `TAURI_DEBUG` and other env variables
    // https://tauri.app/v1/api/config#buildconfig.beforedevcommand
    envPrefix: ["VITE_", "TAURI_"],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src/"),
      }
    },
    define: {
      __BUILD_MODE__: JSON.stringify(getBuildMode())
    }
  };

  return config;
});
