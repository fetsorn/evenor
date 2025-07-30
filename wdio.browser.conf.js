import viteConfig from "./vite.config.js";

export const config = {
  specs: [["./src/test/specs/browser/*.test.jsx"]],
  runner: [
    "browser",
    {
      viteConfig: viteConfig,
    },
  ],
  capabilities: [
    {
      browserName: "firefox",
      "moz:firefoxOptions": {
        // headless breaks csvs.selectStream with "ev.error is undefined"
        //args: ["-headless", "--window-size=1024,768"],
        log: { level: "error" },
      },
    },
  ],
  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 6000000,
  },
  logLevel: "error",
  maxInstances: 1,
  //maxInstancesPerCapability: 1,
  //bail: 0,
  //baseUrl: "",
  //waitforTimeout: 10000000,
  //connectionRetryTimeout: 120000,
  //connectionRetryCount: 3,
  //services: [],
  reporters: ["spec"],
};
