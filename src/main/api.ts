import { app, BrowserWindow, dialog } from "electron";
import fs from "fs";
import path from "path";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node/index.cjs";
import { exportPDF, generateLatex } from "./latex";

export class ElectronAPI {

  constructor() {
    // do nothing
  }

  static async readFile(
    _event: any,
    repo: string,
    filepath: string
  ) {
    const home = app.getPath("home");

    const root = path.join(home, ".qualia");

    const file = path.join(root, repo, filepath);

    const content = fs.readFileSync(file, { encoding: "utf8" });

    return content;
  }

  static async writeFile(
    _event: any,
    dir: string,
    filepath: string,
    content: string
  ) {
    const home = app.getPath("home");

    const appdata = path.join(home, ".qualia");

    const file = path.join(appdata, dir, filepath);

    // if path doesn't exist, create it
    // split path into array of directory names
    const path_elements = dir.split("/").concat(filepath.split("/"));

    // remove file name
    path_elements.pop();

    let root = "";

    for (let i = 0; i < path_elements.length; i++) {
      const path_element = path_elements[i];

      root += "/";

      const files = await fs.promises.readdir(path.join(appdata, root));

      if (!files.includes(path_element)) {
        // console.log(`creating directory ${path_element} in ${root}`)
        await fs.promises.mkdir(path.join(appdata, root, path_element));
      } else {
        // console.log(`${root} has ${path_element}`)
      }

      root += path_element;
    }

    await fs.promises.writeFile(file, content);
  }

  static async uploadFile(_event: any, repo: string) {
    const res = await dialog.showOpenDialog({ properties: ["openFile"] });

    if (res.canceled) {
      throw "cancelled";
    } else {
      const pathSource = res.filePaths[0];

      const filename = pathSource.substring(pathSource.lastIndexOf("/") + 1);

      const homePath = app.getPath("home");

      const rootPath = path.join(homePath, ".qualia");

      const localDir = "local";

      const localPath = path.join(rootPath, repo, localDir);

      if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localPath);

        // console.log(`Directory ${root} is created.`);
      } else {
        // console.log(`Directory ${root} already exists.`);
      }

      const destinationPath = path.join(localPath, filename);

      // copy file to local/

      if (!fs.existsSync(destinationPath)) {
        await fs.promises.copyFile(pathSource, destinationPath);

        // console.log(`Directory ${root} is created.`);
      } else {
        // throw `file ${destinationPath} already exists`;
      }

      // return the path to local/filename

      return filename;
    }
  }

  static async select(_event: any, searchParams: URLSearchParams) {
  //
  }

  static async queryOptions(_event: any, branch: string) {
  //
  }

  static async updateEntry(_event: any, entry: any, overview: any) {
  //
  }

  static async deleteEntry(_event: any, entry: any, overview: any) {
  //
  }

  static async clone(
    _event: any,
    url: string,
    token: string,
    dir: string
  ) {
    const home = app.getPath("home");

    const root = path.join(home, ".qualia");

    const dirPath = path.join(root, dir);

    const options: any = {
      fs,
      http,
      dir: dirPath,
      url,
      singleBranch: true,
      depth: 1,
    };

    if (token) {
      options.onAuth = () => ({
        username: token,
      })
    }

    await git.clone(options);
  }

  static async commit(_event: any, dir: string) {
    console.log("commit", dir);

    const message = [];

    const statusMatrix: any = await git.statusMatrix({
      fs,
      dir,
    });

    for (let [
      filePath,
      HEADStatus,
      workingDirStatus,
      stageStatus,
    ] of statusMatrix) {
      if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
        await git.resetIndex({
          fs,
          dir,
          filepath: filePath,
        });

        [filePath, HEADStatus, workingDirStatus, stageStatus] =
        await git.statusMatrix({
          fs,
          dir,
          filepaths: [filePath],
        });

        if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
          continue;
        }
      }

      if (workingDirStatus !== stageStatus) {
        let status;

        if (workingDirStatus === 0) {
          status = "deleted";

          await git.remove({
            fs,
            dir,
            filepath: filePath,
          });
        } else {
          await git.add({
            fs,
            dir,
            filepath: filePath,
          });

          if (HEADStatus === 1) {
            status = "modified";
          } else {
            status = "added";
          }
        }

        message.push(`${filePath} ${status}`);
      }
    }

    if (message.length !== 0) {
      console.log("commit:", message.toString());

      await git.commit({
        fs,
        dir,
        author: {
          name: "name",
          email: "name@mail.com",
        },
        message: message.toString(),
      });
    }
  }

  static async push(_event: any, token: string) {
  //
  }

  static async pull(_event: any, token: string) {
  //
  }

  static async addRemote(_event: any, url: string) {
  //
  }

  static async ensure(_event: any, dir: string, schema: string) {
    const home = app.getPath("home");

    const root = path.join(home, ".qualia");

    if (!(await fs.promises.readdir(home)).includes(".qualia")) {
      await fs.promises.mkdir(root);
    }

    const store = path.join(root, "store");

    if (!(await fs.promises.readdir(root)).includes("store")) {
      await fs.promises.mkdir(store);
    }

    const name = dir.replace(/^\/store\//, "");

    const repoDir = path.join(store, name);

    if (!(await fs.promises.readdir(store)).includes(name)) {
      await fs.promises.mkdir(repoDir);

      await git.init({ fs, dir: repoDir });
    }

    await fs.promises.writeFile(repoDir + "/metadir.json", schema, "utf8");

    await ElectronAPI.commit({}, repoDir);
  }

  static async symlink(_event: any, dir: string, name: string) {
    const home = app.getPath("home");

    const root = path.join(home, ".qualia");

    const repos = path.join(root, "repos");

    if (!(await fs.promises.readdir(root)).includes("repos")) {
      await fs.promises.mkdir(repos);
    }

    const store = path.join(root, "store");

    await fs.promises.unlink(`${repos}/${name}`);

    await fs.promises.symlink(`${store}/${dir}`, `${repos}/${name}`);
  }

  static async rimraf(_event: any, filepath: string) {
    const home = app.getPath("home");

    const root = path.join(home, ".qualia");

    const file = path.join(root, filepath);

    try {
      const stats = await fs.promises.stat(file);

      if (stats.isFile()) {
        await fs.promises.unlink(file);
      } else if (stats.isDirectory()) {
        await fs.promises.rmdir(file, { recursive: true });
      }
    } catch (e) {
      console.log(`failed to rimraf ${e}`);
    }
  }

  static async ls(_event: any, filepath: string) {
  //
  }

  static async getRemote(_event: any, repo: string) {
    const home = app.getPath("home");

    const root = path.join(home, ".qualia");

    const dir = path.join(root, repo);

    return await git.getConfig({
      fs,

      dir,

      path: "remote.origin.url",
    });
  }

  static async latex() {
    const text = generateLatex([]);

    const pdfURL = await exportPDF(text);

    return pdfURL;
  }

  static async openPDF(_event: any, url: string) {
    const win = new BrowserWindow({
      webPreferences: {
        plugins: true,
      },
    });

    win.loadURL(url);
  }

  static async fetchAsset(
    _event: any,
    repo: string,
    filepath: string
  ): Promise<ArrayBuffer> {
    const home = app.getPath("home");

    const root = path.join(home, ".qualia");

    const file = path.join(root, repo, filepath);

    const b: Buffer = fs.readFileSync(file);

    const content: ArrayBuffer = b.buffer.slice(
      b.byteOffset,
      b.byteOffset + b.byteLength
    );

    return content;
  }
}
