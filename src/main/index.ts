/* eslint global-require: off, no-console: off */
import path from "path";
import { app, BrowserWindow, shell, ipcMain } from "electron";
import MenuBuilder from "./menu";
import { ElectronAPI as API } from "./api";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

const createWindow = async () => {

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, "assets")
    : path.join(__dirname, "../../assets");

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath("icon.png"),
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

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

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: "deny" };
  });
};

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    ipcMain.handle("readFile", API.readFile);
    ipcMain.handle("writeFile", API.writeFile);
    ipcMain.handle("uploadFile", API.uploadFile);
    ipcMain.handle("select", API.select);
    ipcMain.handle("queryOptions", API.queryOptions);
    ipcMain.handle("updateEntry", API.updateEntry);
    ipcMain.handle("deleteEntry", API.deleteEntry);
    ipcMain.handle("clone", API.clone);
    ipcMain.handle("commit", API.commit);
    ipcMain.handle("push", API.push);
    ipcMain.handle("pull", API.pull);
    ipcMain.handle("addRemote", API.addRemote);
    ipcMain.handle("ensure", API.ensure);
    ipcMain.handle("symlink", API.symlink);
    ipcMain.handle("rimraf", API.rimraf);
    ipcMain.handle("ls", API.ls);
    ipcMain.handle("getRemote", API.getRemote);
    ipcMain.handle("latex", API.latex);
    ipcMain.handle("openPDF", API.openPDF);
    ipcMain.handle("fetchAsset", API.fetchAsset);
    createWindow();
    
  })
  .catch(console.log);

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
  // if (BrowserWindow.getAllWindows().length === 0) {
  //   createWindow();
  // }
});
