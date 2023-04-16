// cannot use esm because loads raw as cjs by absolute path
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  select: (dir, searchParams) => ipcRenderer.invoke('select', dir, searchParams),

  queryOptions: (dir, branch) => ipcRenderer.invoke('queryOptions', dir, branch),

  updateEntry: (dir, entry, overview) => ipcRenderer.invoke('updateEntry', dir, entry, overview),

  deleteEntry: (dir, entry, overview) => ipcRenderer.invoke('deleteEntry', dir, entry, overview),

  ensure: (dir, schema, name) => ipcRenderer.invoke('ensure', dir, schema, name),

  commit: (dir) => ipcRenderer.invoke('commit', dir),

  clone: (dir, remote, token, name) => ipcRenderer.invoke('clone', dir, remote, token, name),

  push: (dir, remote, token) => ipcRenderer.invoke('push', dir, remote, token),

  pull: (dir, remote, token) => ipcRenderer.invoke('pull', dir, remote, token),

  getSettings: (dir) => ipcRenderer.invoke('getSettings', dir),

  readSchema: (dir) => ipcRenderer.invoke('readSchema', dir),

  readGedcom: (dir) => ipcRenderer.invoke('readGedcom', dir),

  readIndex: (dir) => ipcRenderer.invoke('readIndex', dir),

  cloneView: (dir, remote, token) => ipcRenderer.invoke('cloneView', dir, remote, token),

  fetchAsset: (dir, filename, token) => ipcRenderer.invoke('fetchAsset', dir, filename, token),

  downloadAsset: (dir, filename, filehash, token) => ipcRenderer.invoke('downloadAsset', dir, filename, filehash, token),

  putAsset: (dir, filename, content) => ipcRenderer.invoke('putAsset', dir, filename, content),

  uploadFile: (dir) => ipcRenderer.invoke('uploadFile', dir),

  writeFeed: (dir, xml) => ipcRenderer.invoke('writeFeed', dir, xml),

  downloadUrlFromPointer: (dir, url, token, pointerInfo) => ipcRenderer.invoke('downloadUrlFromPointer', dir, url, token, pointerInfo),

  uploadBlobsLFS: (dir, url, token, files) => ipcRenderer.invoke('uploadBlobsLFS', dir, url, token, files),

  zip: (dir) => ipcRenderer.invoke('zip', dir),

  pdf: (overview) => ipcRenderer.invoke('pdf', overview),
});
