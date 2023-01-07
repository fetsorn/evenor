import { exportPDF, generateLatex } from "./latex";
import { app, BrowserWindow, dialog } from "electron";
import { manifest } from "../lib/git_template";
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

    const rootPath = path.join(homePath, "qualia");

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

  const root = path.join(home, "qualia");

  const file = path.join(root, repo, filepath);

  const content = fs.readFileSync(file, { encoding: "utf8" });

  return content;
}

export async function writeDataMetadir(
  _event: any,

  repo: string,

  filepath: string,

  content: string
) {
  // console.log("electron writeDataMetadir", repo, filepath, content);

  const home = app.getPath("home");

  const root = path.join(home, "qualia");

  const file = path.join(root, repo, filepath);

  await fs.promises.writeFile(file, content);
}

export async function fetchAsset(
  _event: any,

  repo: string,

  filepath: string
): Promise<ArrayBuffer> {
  // console.log("electron fetchDataMetadir");

  const home = app.getPath("home");

  const root = path.join(home, "qualia");

  const file = path.join(root, repo, filepath);

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

  const root = path.join(home, "qualia");

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

  const root = path.join(home, "qualia");

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

  const root = path.join(home, "qualia");

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

  const root = path.join(home, "qualia");

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

export async function gitcommit(repo: string) {
  // console.log("commit");

  const home = app.getPath("home");

  const root = path.join(home, "qualia");

  const repoDir = path.join(root, repo);

  const message = [];

  const statusMatrix: any = await git.statusMatrix({
    fs,

    dir: repoDir,
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

        dir: repoDir,

        filepath: filePath,
      });

      [filePath, HEADStatus, workingDirStatus, stageStatus] =
        await git.statusMatrix({
          fs,

          dir: repoDir,

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

          dir: repoDir,

          filepath: filePath,
        });
      } else {
        await git.add({
          fs,

          dir: repoDir,

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
    // console.log("commit:", message.toString());

    await git.commit({
      fs,

      dir: repoDir,

      author: {
        name: "name",

        email: "name@mail.com",
      },

      message: message.toString(),
    });
  }
}

export async function gitCreate(_event: any, repo: string) {
  // console.log("electron gitCreate");

  const home = app.getPath("home");

  const root = path.join(home, "qualia");

  const repoDir = root + "/" + repo;

  // console.log("gitCreate");

  if ((await fs.promises.readdir(root)).includes(repo)) {
    console.log("repo exists");
  } else {
    await fs.promises.mkdir(repoDir);

    await git.init({ fs, dir: repoDir });

    await fs.promises.mkdir(repoDir + "/metadir");

    await fs.promises.writeFile(repoDir + "/metadir.json", manifest, "utf8");

    await fs.promises.mkdir(repoDir + "/metadir/props");

    await fs.promises.mkdir(repoDir + "/metadir/props/datum");

    await fs.promises.writeFile(
      repoDir + "/metadir/props/datum/index.csv",
      "",
      "utf8"
    );

    await fs.promises.mkdir(repoDir + "/metadir/props/date");

    await fs.promises.writeFile(
      repoDir + "/metadir/props/date/index.csv",
      "",
      "utf8"
    );

    await fs.promises.mkdir(repoDir + "/metadir/props/name");

    await fs.promises.writeFile(
      repoDir + "/metadir/props/name/index.csv",
      "",
      "utf8"
    );

    await fs.promises.mkdir(repoDir + "/metadir/props/tag");

    await fs.promises.writeFile(
      repoDir + "/metadir/props/tag/index.csv",
      "",
      "utf8"
    );

    await fs.promises.mkdir(repoDir + "/metadir/props/filepath");

    await fs.promises.writeFile(
      repoDir + "/metadir/props/filepath/index.csv",
      "",
      "utf8"
    );

    await fs.promises.mkdir(repoDir + "/metadir/props/filetype");

    await fs.promises.writeFile(
      repoDir + "/metadir/props/filetype/index.csv",
      "",
      "utf8"
    );

    await fs.promises.mkdir(repoDir + "/metadir/props/filesize");

    await fs.promises.writeFile(
      repoDir + "/metadir/props/filesize/index.csv",
      "",
      "utf8"
    );

    await fs.promises.mkdir(repoDir + "/metadir/props/privacy");

    await fs.promises.writeFile(
      repoDir + "/metadir/props/privacy/index.csv",
      "",
      "utf8"
    );

    await fs.promises.mkdir(repoDir + "/metadir/props/pathrule");

    await fs.promises.writeFile(
      repoDir + "/metadir/props/pathrule/index.csv",
      "",
      "utf8"
    );

    await fs.promises.mkdir(repoDir + "/metadir/pairs");

    await fs.promises.writeFile(
      repoDir + "/metadir/pairs/datum-hostdate.csv",
      "",
      "utf8"
    );

    await fs.promises.writeFile(
      repoDir + "/metadir/pairs/datum-guestdate.csv",
      "",
      "utf8"
    );

    await fs.promises.writeFile(
      repoDir + "/metadir/pairs/datum-privacy.csv",
      "",
      "utf8"
    );

    await fs.promises.writeFile(
      repoDir + "/metadir/pairs/datum-hostname.csv",
      "",
      "utf8"
    );

    await fs.promises.writeFile(
      repoDir + "/metadir/pairs/datum-guestname.csv",
      "",
      "utf8"
    );

    await fs.promises.writeFile(
      repoDir + "/metadir/pairs/datum-filepath.csv",
      "",
      "utf8"
    );

    await fs.promises.writeFile(
      repoDir + "/metadir/pairs/datum-tag.csv",
      "",
      "utf8"
    );

    await fs.promises.writeFile(
      repoDir + "/metadir/pairs/filepath-moddate.csv",
      "",
      "utf8"
    );

    await fs.promises.writeFile(
      repoDir + "/metadir/pairs/filepath-filetype.csv",
      "",
      "utf8"
    );

    await fs.promises.writeFile(
      repoDir + "/metadir/pairs/filepath-filesize.csv",
      "",
      "utf8"
    );

    await fs.promises.writeFile(
      repoDir + "/metadir/pairs/filepath-filehash.csv",
      "",
      "utf8"
    );

    await gitcommit(repo);
  }
}
