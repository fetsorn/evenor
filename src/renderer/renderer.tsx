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
      readFile(dir: string, filepath: string): any;

      writeFile(dir: string, filepath: string, content: string): any;

      uploadFile(dir: string): any;

      select(dir: string, searchParams: URLSearchParams): any;

      queryOptions(dir: string, branch: string): any;

      updateEntry(dir: string, entry: any, overview: any): any;

      deleteEntry(dir: string, entry: any, overview: any): any;

      clone(dir: string, url: string, token: string): any;

      commit(dir: string): any;

      push(dir: string, token: string): any;

      pull(dir: string, token: string): any;

      addRemote(dir: string, url: string): any;

      ensure(dir: string, schema: string): any;

      symlink(dir: string, name: string): any;

      rimraf(rimrafpath: string): any;

      ls(lspath: string): any;

      getRemote(dir: string): any;

      latex(): any;

      openPDF(url: string): any;

      fetchAsset(dir: string, filepath: string): Promise<ArrayBuffer>;
    };
  }
}
