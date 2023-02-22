import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  readFile: (dir, filepath) =>
    ipcRenderer.invoke("readFile", dir, filepath),

  writeFile: (dir, filepath, content) =>
    ipcRenderer.invoke("writeFile", dir, filepath, content),

  uploadFile: (dir) => ipcRenderer.invoke("uploadFile", dir),

  select: (dir, searchParams) =>
    ipcRenderer.invoke("select", dir, searchParams),

  queryOptions: (dir, branch) =>
    ipcRenderer.invoke("queryOptions", dir, branch),

  updateEntry: (dir, entry, overview) =>
    ipcRenderer.invoke("updateEntry", dir, entry, overview),

  deleteEntry: (dir, entry, overview) =>
    ipcRenderer.invoke("deleteEntry", dir, entry, overview),

  clone: (dir, url, token) =>
    ipcRenderer.invoke("clone", dir, url, token),

  commit: (dir) =>
    ipcRenderer.invoke("commit", dir),

  push: (dir, token) =>
    ipcRenderer.invoke("push", dir, token),

  pull: (dir, token) =>
    ipcRenderer.invoke("pull", dir, token),

  addRemote: (dir, url) =>
    ipcRenderer.invoke("addRemote", dir, url),

  ensure: (dir, schema) =>
    ipcRenderer.invoke("ensure", dir, schema),

  symlink: (dir, name) =>
    ipcRenderer.invoke("symlink", dir, name),

  rimraf: (rimrafpath) => ipcRenderer.invoke("rimraf", rimrafpath),

  ls: (lspath) => ipcRenderer.invoke("ls", lspath),

  getRemote: (repo) => ipcRenderer.invoke("getRemote", repo),

  latex: () => ipcRenderer.invoke("latex"),

  openPDF: (url) => ipcRenderer.invoke("openPDF", url),

  fetchAsset: (dir, filepath) =>
    ipcRenderer.invoke("fetchAsset", dir, filepath),
});
