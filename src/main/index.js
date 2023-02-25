import path from 'path';
import url from 'url';
import {
  app, BrowserWindow, ipcMain, shell,
} from 'electron';
import { ElectronAPI as API } from 'lib/api/electron.js';

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

let mainWindow = null;

const createWindow = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'app/.webpack/renderer/public')
    : path.join(dirname, '../../.webpack/renderer/public');

  const getAssetPath = (...paths) => path.join(RESOURCES_PATH, ...paths);

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      // eslint-disable-next-line
      preload: getAssetPath("preload.js"),
      contextIsolation: true,
    },
  });

  // eslint-disable-next-line
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  // mainWindow.loadURL("https://example.com");

  mainWindow.webContents.once('dom-ready', () => {
    mainWindow.webContents.openDevTools();
  });

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

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
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
      async (_event, dir) => (new API(dir)).uploadFile(),
    );

    ipcMain.handle(
      'select',
      async (_event, dir, searchParams) => (new API(dir)).select(new URLSearchParams(searchParams)),
    );

    ipcMain.handle(
      'queryOptions',
      async (_event, dir, branch) => (new API(dir)).queryOptions(branch),
    );

    ipcMain.handle(
      'updateEntry',
      async (_event, dir, entry, overview) => (new API(dir)).updateEntry(entry, overview),
    );

    ipcMain.handle(
      'deleteEntry',
      async (_event, dir, entry, overview) => (new API(dir)).deleteEntry(entry, overview),
    );

    ipcMain.handle(
      'ensure',
      async (_event, dir, schema, name) => (new API(dir)).ensure(schema, name),
    );

    ipcMain.handle(
      'commit',
      async (_event, dir) => (new API(dir)).commit(),
    );

    ipcMain.handle(
      'clone',
      async (_event, dir, remote, token, name) => (new API(dir)).clone(remote, token, name),
    );

    ipcMain.handle(
      'push',
      async (_event, dir, remote, token) => (new API(dir)).push(remote, token),
    );

    ipcMain.handle(
      'pull',
      async (_event, dir, remote, token) => (new API(dir)).pull(remote, token),
    );

    ipcMain.handle(
      'getSettings',
      async (_event, dir) => (new API(dir)).getSettings(),
    );

    ipcMain.handle(
      'readSchema',
      async (_event, dir) => (new API(dir)).readSchema(),
    );

    ipcMain.handle(
      'readGedcom',
      async (_event, dir) => (new API(dir)).readGedcom(),
    );

    ipcMain.handle(
      'readIndex',
      async (_event, dir) => (new API(dir)).readIndex(),
    );

    createWindow();
  })
  .catch(console.log);

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
