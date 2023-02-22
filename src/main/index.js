import path from "path";
// import { app, BrowserWindow, shell, ipcMain } from "electron";
import { app, BrowserWindow } from "electron";

let mainWindow = null;

const createWindow = async () => {

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, "assets")
    : path.join(__dirname, "../../assets");

  const getAssetPath = (...paths) => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath("icon.png"),
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      // preload: path.join(__dirname, "../../.webpack/renderer/main_window/preload.js"),
      // sandbox: false,
      // webSecurity: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  // mainWindow.loadURL("https://example.com");

  mainWindow.webContents.once("dom-ready", () => {
    mainWindow.webContents.openDevTools();
  });

  mainWindow.on("ready-to-show", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

//   // Open urls in the user's browser
//   mainWindow.webContents.setWindowOpenHandler((edata) => {
//     shell.openExternal(edata.url);
//     return { action: "deny" };
//   });
};

/**
 * Add event listeners...
 */

// app.on("window-all-closed", () => {
//   // Respect the OSX convention of having the application in memory even
//   // after all windows have been closed
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });

app
  .whenReady()
  .then(() => {
    createWindow();
  })
  .catch(console.log);

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
