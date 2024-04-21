import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config.js';
import { fileURLToPath } from 'url';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config
export default defineConfig((env) => {
  /** @type {import('vite').ConfigEnv<'renderer'>} */
  const forgeEnv = env;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  /** @type {import('vite').UserConfig} */
  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [pluginExposeRenderer(name), nodePolyfills()],
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@": fileURLToPath(new URL('src/', import.meta.url)),

      }
    },
    worker: {
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        }
      }
    },
    clearScreen: false,
    define: {
      __BUILD_MODE__: `"electron"`,
    }
  };
});
