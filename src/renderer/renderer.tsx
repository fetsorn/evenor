import { createRoot } from "react-dom/client";
import App from "./app";

import "normalize.css";
import "./index.css";
import "./i18n/config";

const container = document.getElementById("root") ?? null;
const root = createRoot(container);
root.render(<App />);

declare global {
  const __BUILD_MODE__: string;
  interface Window {
    fs: any;
    pfs: any;
    dir: any;
    electron: {
      fetchDataMetadir(repo: string, path: string): any;
      writeDataMetadir(repo: string, path: string, content: string): any;
      clone(url: string, token: string, dir: string): any;
      gitListRepos(): Promise<string[]>;
      getRemote(repo: string): any;
      rimraf(path: string): any;
      latex(): any;
      openPDF(url: string): any;
      uploadFile(repo: string): any;
      fetchAsset(repo: string, path: string): Promise<ArrayBuffer>;
      linkRepo(repodir: string, reponame: string): any;
      ensureRepo(repo: string, schema: string): any;
    };
  }
}
