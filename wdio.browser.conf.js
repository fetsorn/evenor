import fs from "node:fs";
let gitServer;
let staticServer;

export const config = {
  specs: [["./test/browser/clone.test.jsx"]],
  runner: ["browser", {}],
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
    const { default: factory } =
      await import("git-http-mock-server/middleware.js");
    const { default: cors } = await import("git-http-mock-server/cors.js");

    var config = {
      root: path.resolve(import.meta.dirname, "test/fixtures/bare"),
      glob: "*",
      route: "/",
    };

    gitServer = http.createServer(cors(factory(config)));

    gitServer.listen(8174);

    // static server for evenor's public/
    const publicDir = path.resolve(import.meta.dirname, "public");
    staticServer = http.createServer((req, res) => {
      const filePath = path.join(
        publicDir,
        req.url === "/" ? "index.html" : req.url,
      );
      const ext = path.extname(filePath);
      const mimeTypes = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".png": "image/png",
      };
      fs.promises
        .readFile(filePath)
        .then((data) => {
          res.writeHead(200, {
            "Content-Type": mimeTypes[ext] || "application/octet-stream",
          });
          res.end(data);
        })
        .catch(() => {
          res.writeHead(404);
          res.end("Not found");
        });
    });
    staticServer.listen(8175);
  },
  afterSession: () => {
    gitServer.close();
    staticServer.close();
  },
};
