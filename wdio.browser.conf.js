import viteConfig from "./vite.config.js";

export const config = {
  specs: [["./src/test/specs/**/*.test.jsx"]],
  runner: [
    "browser",
    {
      viteConfig: viteConfig,
    },
  ],
  capabilities: [
    {
      browserName: "firefox",
      //"moz:firefoxOptions": {
      //  args: ["-headless"],
      //},
    },
  ],
  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
  logLevel: "error",
  //maxInstances: 10,
  //bail: 0,
  //baseUrl: "",
  //waitforTimeout: 10000,
  //connectionRetryTimeout: 120000,
  //connectionRetryCount: 3,
  //services: [],
  //reporters: ["spec"],
};
