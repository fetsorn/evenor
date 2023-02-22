import path from 'path';
import url from 'url';
// import { app, BrowserWindow, shell, ipcMain } from "electron";
import { app, BrowserWindow, ipcMain } from 'electron';
import { ElectronAPI as API } from 'lib/api/electron.js';
import { MenuBuilder } from './menu.js';

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

let mainWindow = null;

const createWindow = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths) => path.join(RESOURCES_PATH, ...paths);

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      // eslint-disable-next-line
      preload: path.resolve(dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  // preload: path.join(__dirname, "../../.webpack/renderer/main_window/preload.js"),
  // sandbox: false,
  // webSecurity: false,

  // eslint-disable-next-line
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  // mainWindow.loadURL("https://example.com");

  // mainWindow.webContents.once('dom-ready', () => {
  //   mainWindow.webContents.openDevTools();
  // });

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

//   // Open urls in the user's browser
//   mainWindow.webContents.setWindowOpenHandler((edata) => {
//     shell.openExternal(edata.url);
//     return { action: "deny" };
//   });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    ipcMain.handle(
      'uploadFile',
      (_event, dir) => (new API(dir)).uploadFile(),
    );

    ipcMain.handle(
      'select',
      (_event, dir, searchParams) => (new API(dir)).select(new URLSearchParams(searchParams)),
    );

    ipcMain.handle(
      'queryOptions',
      (_event, dir, branch) => (new API(dir)).queryOptions(branch),
    );

    ipcMain.handle(
      'updateEntry',
      (_event, dir, entry, overview) => (new API(dir)).updateEntry(entry, overview),
    );

    ipcMain.handle(
      'deleteEntry',
      (_event, dir, entry, overview) => (new API(dir)).deleteEntry(entry, overview),
    );

    ipcMain.handle(
      'ensure',
      (_event, dir, schema, name) => (new API(dir)).ensure(schema, name),
    );

    ipcMain.handle(
      'commit',
      (_event, dir) => (new API(dir)).commit(),
    );

    ipcMain.handle(
      'clone',
      (_event, dir, remote, token, name) => (new API(dir)).clone(remote, token, name),
    );

    ipcMain.handle(
      'push',
      (_event, dir, remote, token) => (new API(dir)).push(remote, token),
    );

    ipcMain.handle(
      'pull',
      (_event, dir, remote, token) => (new API(dir)).pull(remote, token),
    );

    ipcMain.handle(
      'getSettings',
      (_event, dir) => (new API(dir)).getSettings(),
    );

    ipcMain.handle(
      'readSchema',
      (_event, dir) => (new API(dir)).readSchema(),
    );

    createWindow();
  })
  .catch(console.log);

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});