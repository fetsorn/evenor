import { defineConfig, mergeConfig } from 'vite';
import {
  getBuildConfig,
  getBuildDefine,
  external,
  pluginHotRestart,
} from './vite.base.config.js';
import { workerPlugin } from '@fetsorn/vite-node-worker';

// https://vitejs.dev/config
export default defineConfig((forgeEnv) => {
  const { forgeConfigSelf } = forgeEnv;
  const config = {
    build: {
      lib: {
        entry: forgeConfigSelf.entry,
        fileName: () => '[name].cjs',
        formats: ['cjs'],
      },
      rollupOptions: {
        external: [...external]
      },
    },
    plugins: [pluginHotRestart('restart'), workerPlugin()],
    define: getBuildDefine(forgeEnv),
    resolve: {
      // Load the Node.js entry.
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
  };

  return mergeConfig(getBuildConfig(forgeEnv), config);
});
