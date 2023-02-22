// const process = require("process");

module.exports = {
  // packagerConfig: {
  //   electronZipDir: process.env.electron_zip_dir,
  // },
  // makers: [
  //   {
  //     name: "@electron-forge/maker-squirrel",
  //     config: {},
  //   },
  //   {
  //     name: "@electron-forge/maker-zip",
  //     platforms: ["darwin", "win32", "linux"],
  //   },
  //   {
  //     name: "@electron-forge/maker-deb",
  //     config: {},
  //   },
  //   {
  //     name: "@electron-forge/maker-rpm",
  //     config: {},
  //   },
  // ],
  plugins: [
    {
      name: "@electron-forge/plugin-webpack",
      config: {
        devContentSecurityPolicy:
          "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;",
        mainConfig: "./webpack.main.config.cjs",
        renderer: {
          config: "./webpack.renderer.config.cjs",
          entryPoints: [
            {
              name: "main_window",
              html: "./src/renderer/index.html",
              js: "./src/renderer/renderer.jsx",
              preload: {
                js: "./src/main/preload.js",
              },
            },
          ],
        },
      },
    }
  ],
};
