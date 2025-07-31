import { homedir, tmpdir } from "os";
import { resolve } from "path";
import { spawn, spawnSync } from "child_process";

// keep track of the `tauri-driver` child process
let tauriDriver;
let gitServer;

export const config = {
  runner: "local",
  hostname: "localhost",
  port: 4444,
  specs: ["./src/test/tauri/push.test.js"],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      "tauri:options": {
        application: "./src-tauri/target/release/evenor",
        args: ["-d", tmpdir()], // will create store/ in /tmp
      },
    },
  ],
  reporters: ["spec"],
  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },

  // ensure the rust project is built since we expect this binary to exist for the webdriver sessions
  onPrepare: () => spawnSync("cargo", ["build", "--release"]),

  // ensure we are running `tauri-driver` before the session starts so that we can proxy the webdriver requests
  beforeSession: async () => {
    tauriDriver = spawn(
      resolve(homedir(), ".cargo", "bin", "tauri-driver"),
      [],
      { stdio: [null, process.stdout, process.stderr] },
    );

    // run git-http-mock-server
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
  // clean up the `tauri-driver` process we spawned at the start of the session
  afterSession: () => {
    tauriDriver.kill();

    gitServer.close();
  },
};
