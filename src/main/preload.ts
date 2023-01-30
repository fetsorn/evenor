import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  fetchDataMetadir: (repo: string, path: string) =>
    ipcRenderer.invoke("fetchDataMetadir", repo, path),
  writeDataMetadir: (repo: string, path: string, content: string) =>
    ipcRenderer.invoke("writeDataMetadir", repo, path, content),
  clone: (url: string, token: string, dir: string) =>
    ipcRenderer.invoke("clone", url, token, dir),
  gitListRepos: () => ipcRenderer.invoke("gitListRepos"),
  getRemote: (repo: string) => ipcRenderer.invoke("getRemote", repo),
  rimraf: (path: string) => ipcRenderer.invoke("rimraf", path),
  latex: () => ipcRenderer.invoke("latex"),
  openPDF: (url: string) => ipcRenderer.invoke("openPDF", url),
  uploadFile: (repo: string) => ipcRenderer.invoke("uploadFile", repo),
  fetchAsset: (repo: string, path: string) =>
    ipcRenderer.invoke("fetchAsset", repo, path),
  ensureRepo: (repo: string, schema: string) =>
    ipcRenderer.invoke("ensureRepo", repo, schema),
  linkRepo: (repodir: string, reponame: string) =>
    ipcRenderer.invoke("linkRepo", repodir, reponame),
});
