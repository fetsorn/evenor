import viteConfig from "./vite.config.js";

export const config = {
  specs: [["./test/specs/**/*.jsx"]],
  exclude: [],
  runner: [
    "browser",
    {
      viteConfig: viteConfig,
      coverage: {
        enabled: true,
        statements: 100,
        branches: 43,
        functions: 85,
        lines: 100,
      },
    },
  ],
  maxInstances: 10,
  capabilities: [
    {
      browserName: "firefox",
    },
  ],
  logLevel: "info",
  bail: 0,
  baseUrl: "",
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [],

  framework: "mocha",
  reporters: ["spec"],
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
};
