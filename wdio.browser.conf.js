import viteConfig from "./vite.config.js";

let gitServer;

export const config = {
  specs: [["./src/test/browser/*.test.jsx"]],
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
        //NOTE: headless breaks csvs.selectStream with "ev.error is undefined"
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
  beforeSession: async () => {
    const http = await import("http");
    const path = await import("path");
    const { default: factory } = await import(
      "git-http-mock-server/middleware.js"
    );
    const { default: cors } = await import("git-http-mock-server/cors.js");

    var config = {
      root: path.resolve(import.meta.dirname, "src/test/fixtures/bare"),
      glob: "*",
      route: "/",
    };

    gitServer = http.createServer(cors(factory(config)));

    gitServer.listen(8174);
  },
  afterSession: () => {
    gitServer.close();
  },
};
