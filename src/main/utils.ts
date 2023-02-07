import { exportPDF, generateLatex } from "./latex";
import { app, BrowserWindow, dialog } from "electron";
import fs from "fs";
import path from "path";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node/index.cjs";

export async function latex() {
  const text = generateLatex([]);

  const pdfURL = await exportPDF(text);

  return pdfURL;
}

export async function openPDF(_event: any, url: string) {
  const win = new BrowserWindow({
    webPreferences: {
      plugins: true,
    },
  });

  win.loadURL(url);
}

export async function uploadFile(_event: any, repo: string) {
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
      throw `file ${destinationPath} already exists`;
    }

    // return the path to local/filename

    return filename;
  }
}

export async function fetchDataMetadir(
  _event: any,
  repo: string,
  filepath: string
) {
  // console.log("electron fetchDataMetadir");

  const home = app.getPath("home");

  const root = path.join(home, ".qualia");

  const file = path.join(root, repo, filepath);

  const content = fs.readFileSync(file, { encoding: "utf8" });

  return content;
}

export async function writeDataMetadir(
  _event: any,
  dir: string,
  filepath: string,
  content: string
) {
  // console.log("electron writeDataMetadir", dir, path, content);

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

    // console.log(files)

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

export async function fetchAsset(
  _event: any,

  repo: string,

  filepath: string
): Promise<ArrayBuffer> {
  // console.log("electron fetchDataMetadir");

  const home = app.getPath("home");

  const root = path.join(home, ".qualia");

  const file = path.join(root, "repos", repo, filepath);

  const b: Buffer = fs.readFileSync(file);

  const content: ArrayBuffer = b.buffer.slice(
    b.byteOffset,

    b.byteOffset + b.byteLength
  );

  return content;
}

export async function clone(
  _event: any,
  url: string,
  token: string,
  dir: string
) {
  // console.log("electron clone");

  const home = app.getPath("home");

  const root = path.join(home, ".qualia");

  const dirPath = path.join(root, dir);

  if (token === "") {
    await git.clone({
      fs,

      http,

      dir: dirPath,

      url,

      singleBranch: true,

      depth: 1,
    });
  } else {
    await git.clone({
      fs,

      http,

      dir: dirPath,

      url,

      singleBranch: true,

      depth: 1,

      onAuth: () => ({
        username: token,
      }),
    });
  }
}

export async function gitListRepos(): Promise<string[]> {
  // console.log("electron gitListRepos");

  const home = app.getPath("home");

  const root = path.join(home, ".qualia");

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root);

    // console.log(`Directory ${root} is created.`);
  } else {
    // console.log(`Directory ${root} already exists.`);
  }

  const repos = await fs.promises.readdir(root);

  // console.log(repos, root);

  return repos;
}

export async function getRemote(_event: any, repo: string) {
  const home = app.getPath("home");

  const root = path.join(home, ".qualia");

  const dir = path.join(root, repo);

  return await git.getConfig({
    fs,

    dir,

    path: "remote.origin.url",
  });
}

export async function rimraf(_event: any, filepath: string) {
  // console.log("electron rimraf");

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

export async function gitcommit(dir: string) {
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

export async function ensureRepo(_event: any, repo: string, schema: string) {
  const home = app.getPath("home");

  const root = path.join(home, ".qualia");

  console.log(root)

  if (!(await fs.promises.readdir(home)).includes(".qualia")) {
    await fs.promises.mkdir(root);
  }

  const store = path.join(root, "store");

  console.log(store)

  if (!(await fs.promises.readdir(root)).includes("store")) {
    await fs.promises.mkdir(store);
  }

  const repoDir = path.join(store, repo);

  console.log(repoDir)

  console.log("try to mkdir repo", store, repo)
  if (!(await fs.promises.readdir(store)).includes(repo)) {
    await fs.promises.mkdir(repoDir);

    await git.init({ fs, dir: repoDir });
  }

  await fs.promises.writeFile(repoDir + "/metadir.json", schema, "utf8");

  await gitcommit(repoDir);
}

export async function linkRepo(_event: any, repodir: string, reponame: string) {
  const home = app.getPath("home");

  const root = path.join(home, ".qualia");

  const repos = path.join(root, "repos");

  if (!(await fs.promises.readdir(root)).includes("repos")) {
    await fs.promises.mkdir(repos);
  }

  const store = path.join(root, "store");

  await fs.promises.unlink(`${repos}/${reponame}`);

  await fs.promises.symlink(`${store}/${repodir}`, `${repos}/${reponame}`);
}
