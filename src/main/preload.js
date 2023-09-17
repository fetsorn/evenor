// cannot use esm because loads raw as cjs by absolute path
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  select: (dir, searchParams) => ipcRenderer.invoke('select', dir, searchParams),

  selectStream: (dir, searchParams, handlerEnqueue, handlerClose) => {
    // console.log('main/preload: selectStream', dir);
    ipcRenderer.on('selectStream:enqueue', handlerEnqueue)
    ipcRenderer.on('selectStream:close', () => {
      ipcRenderer.removeAllListeners('selectStream:enqueue')
      ipcRenderer.removeAllListeners('selectStream:close')
      handlerClose()
    })
    ipcRenderer.invoke('selectStream', dir, searchParams);
  },

  closeStream: (dir) => ipcRenderer.invoke('closeStream', dir),

  queryOptions: (dir, branch) => ipcRenderer.invoke('queryOptions', dir, branch),

  updateEntry: (dir, entry, overview) => ipcRenderer.invoke('updateEntry', dir, entry, overview),

  deleteEntry: (dir, entry, overview) => ipcRenderer.invoke('deleteEntry', dir, entry, overview),

  ensure: (dir, schema, name) => ipcRenderer.invoke('ensure', dir, schema, name),

  commit: (dir) => ipcRenderer.invoke('commit', dir),

  clone: (dir, remoteUrl, remoteToken, name) => ipcRenderer.invoke('clone', dir, remoteUrl, remoteToken, name),

  cloneView: (dir, remoteUrl, remoteToken) => ipcRenderer.invoke('cloneView', dir, remoteUrl, remoteToken),

  push: (dir, remote) => ipcRenderer.invoke('push', dir, remote),

  pull: (dir, remote) => ipcRenderer.invoke('pull', dir, remote),

  getSettings: (dir) => ipcRenderer.invoke('getSettings', dir),

  readSchema: (dir) => ipcRenderer.invoke('readSchema', dir),

  readGedcom: (dir) => ipcRenderer.invoke('readGedcom', dir),

  readIndex: (dir) => ipcRenderer.invoke('readIndex', dir),

  fetchAsset: (dir, filename) => ipcRenderer.invoke('fetchAsset', dir, filename),

  downloadAsset: (dir, content, filename) => ipcRenderer.invoke('downloadAsset', dir, content, filename),

  putAsset: (dir, filename, content) => ipcRenderer.invoke('putAsset', dir, filename, content),

  uploadFile: (dir) => ipcRenderer.invoke('uploadFile', dir),

  writeFeed: (dir, xml) => ipcRenderer.invoke('writeFeed', dir, xml),

  uploadBlobsLFS: (dir, remote, files) => ipcRenderer.invoke('uploadBlobsLFS', dir, remote, files),

  zip: (dir) => ipcRenderer.invoke('zip', dir),

  listRemotes: (dir) => ipcRenderer.invoke('listRemotes', dir),

  addRemote: (dir, remoteName, remoteUrl, remoteToken) => ipcRenderer.invoke('addRemote', dir, remoteName, remoteUrl, remoteToken),

  getRemote: (dir, remote) => ipcRenderer.invoke('getRemote', dir, remote),

  addAssetPath: (dir, assetPath) => ipcRenderer.invoke('addAssetPath', dir, assetPath),

  listAssetPaths: (dir) => ipcRenderer.invoke('listAssetPaths', dir),

  downloadUrlFromPointer: (dir, url, token, pointerInfo) => ipcRenderer.invoke('downloadUrlFromPointer', dir, url, token, pointerInfo),
});
