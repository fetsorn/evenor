import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  readFile: (dir: string, path: string) =>
    ipcRenderer.invoke("readFile", dir, path),

  writeFile: (dir: string, path: string, content: string) =>
    ipcRenderer.invoke("writeFile", dir, path, content),

  uploadFile: (dir: string) => ipcRenderer.invoke("uploadFile", dir),

  select: (dir: string, searchParams: URLSearchParams) =>
    ipcRenderer.invoke("select", dir, searchParams),

  queryOptions: (dir: string, branch: string) =>
    ipcRenderer.invoke("queryOptions", dir, branch),

  updateEntry: (dir: string, entry: any, overview: any) =>
    ipcRenderer.invoke("updateEntry", dir, entry, overview),

  deleteEntry: (dir: string, entry: any, overview: any) =>
    ipcRenderer.invoke("deleteEntry", dir, entry, overview),

  clone: (dir: string, url: string, token: string) =>
    ipcRenderer.invoke("clone", dir, url, token),

  commit: (dir: string) =>
    ipcRenderer.invoke("commit", dir),

  push: (dir: string, token: string) =>
    ipcRenderer.invoke("push", dir, token),

  pull: (dir: string, token: string) =>
    ipcRenderer.invoke("pull", dir, token),

  addRemote: (dir: string, url: string) =>
    ipcRenderer.invoke("addRemote", dir, url),

  ensure: (dir: string, schema: string) =>
    ipcRenderer.invoke("ensure", dir, schema),

  symlink: (dir: string, name: string) =>
    ipcRenderer.invoke("symlink", dir, name),

  rimraf: (path: string) => ipcRenderer.invoke("rimraf", path),

  ls: (path: string) => ipcRenderer.invoke("ls", path),

  getRemote: (repo: string) => ipcRenderer.invoke("getRemote", repo),

  latex: () => ipcRenderer.invoke("latex"),

  openPDF: (url: string) => ipcRenderer.invoke("openPDF", url),

  fetchAsset: (dir: string, path: string) =>
    ipcRenderer.invoke("fetchAsset", dir, path),
});
