import fs from "fs";
import path from "path";
import { URLSearchParams } from "url";
import { app, dialog } from "electron";
import { schemaRoot, branchRecordsToSchema } from "./schema.js";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node/index.cjs";
// import { exportPDF, generateLatex } from "lib/latex";
// import { Worker } from "node:worker_threads";
import Worker from "./electron.worker.js?nodeWorker";

const pfs = fs.promises;

if (process.platform === "linux") {
  app.setPath("appData", process.env.XDG_DATA_HOME);
}

let appPath = app.getPath("userData");

if (process.platform === "darwin") {
  appPath = path.join(appPath, "store");
}

const lfsDir = "lfs";

let readWorker;
let streamWorker;

// we run CSVS functions in workers to offload the main thread
// but UI only expects results from the last call to CSVS.select
// so we want only one instance of worker running at any time
// and we terminate the previous instance if worker is still running
async function runWorker(workerData) {
  if (workerData.msg === "select" && readWorker !== undefined) {
    console.log("read worker terminated");
    await readWorker.terminate();

    readWorker = undefined;
  }

  return new Promise((resolve, reject) => {
    //const worker = new Worker(
    //  new URL("./electron.worker.js", import.meta.url),
    //  {
    //    workerData,
    //    type: "module",
    //  },
    //);
    const worker = new Worker({
      workerData,
      type: "module",
    });

    worker.on("message", (message) => {
      if (typeof message === "string" && message.startsWith("log")) {
        // console.log(message);
      } else {
        if (workerData.msg === "select") {
          readWorker = undefined;
        }
        resolve(message);
      }
    });

    worker.on("error", reject);

    worker.on("exit", (code) => {
      if (workerData.msg === "select") {
        readWorker = undefined;
      }
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });

    if (workerData.msg === "select") {
      readWorker = worker;
    }
  });
}

export class ElectronAPI {
  uuid;

  dir;

  constructor(uuid) {
    this.uuid = uuid;

    try {
      // find repo with uuid
      const repoDir = fs
        .readdirSync(appPath)
        .find((repo) => new RegExp(`^${this.uuid}`).test(repo));

      if (repoDir) {
        this.dir = path.join(appPath, repoDir);
      }
    } catch (e) {
      // do nothing
      console.log(e);
    }
  }

  async fetchFile(filepath) {
    const realpath = path.join(this.dir, filepath);

    const content = fs.readFileSync(realpath);

    return content;
  }

  async readFile(filepath) {
    const realpath = path.join(this.dir, filepath);

    const content = fs.readFileSync(realpath, { encoding: "utf8" });

    return content;
  }

  async writeFile(filepath, content) {
    // if path doesn't exist, create it
    // split path into array of directory names
    const pathElements = filepath.split(path.sep);

    // remove file name
    pathElements.pop();

    let root = "";

    for (let i = 0; i < pathElements.length; i += 1) {
      const pathElement = pathElements[i];

      root += path.sep;

      const files = await pfs.readdir(path.join(this.dir, root));

      if (!files.includes(pathElement)) {
        try {
          await pfs.mkdir(path.join(this.dir, root, pathElement));
        } catch (e) {
          // do nothing
        }
      } else {
        // console.log(`${root} has ${pathElement}`)
      }

      root += pathElement;
    }

    const realpath = path.join(this.dir, filepath);

    await pfs.writeFile(realpath, content);
  }

  async putAsset(filename, buffer) {
    // write buffer to assetEndpoint/filename
    const filePath = path.join(lfsDir, filename);

    await this.writeFile(filePath, buffer);
  }

  async uploadFile() {
    const res = await dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
    });

    if (res.canceled) {
      throw Error("cancelled");
    } else {
      let metadata = [];

      for (const filepath of res.filePaths) {
        const fileArrayBuffer = fs.readFileSync(filepath);

        const crypto = await import("crypto");

        const hashArrayBuffer = await crypto.webcrypto.subtle.digest(
          "SHA-256",
          fileArrayBuffer,
        );

        const hashByteArray = Array.from(new Uint8Array(hashArrayBuffer));

        const hashHexString = hashByteArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        const filename = path.basename(filepath);

        const name = filename.replace(/\.[^/.]+$/, "");

        const extension = /(?:\.([^.]+))?$/.exec(filename)[1]?.trim();

        const assetname = `${hashHexString}.${extension}`;

        await this.putAsset(assetname, fileArrayBuffer);

        const metadatum = { hash: hashHexString, name, extension };

        metadata.push(metadatum);
      }

      return metadata;
    }
  }

  async select(searchParams) {
    return runWorker({
      msg: "select",
      dir: this.dir,
      searchParamsString: searchParams.toString(),
    });
  }

  async selectStream(searchParams, enqueueHandler, closeHandler) {
    // console.log('api/electron/selectStream', searchParams.toString());

    try {
      await streamWorker.terminate();
    } catch {
      // do nothing
    }

    //const worker = new Worker(
    //  new URL("./electron.worker.js", import.meta.url),
    //  {
    //    workerData: {
    //      msg: "selectStream",
    //      dir: this.dir,
    //      searchParamsString: searchParams.toString(),
    //    },
    //    type: "module",
    //  },
    //);
    const worker = new Worker({
      workerData: {
        msg: "selectStream",
        dir: this.dir,
        searchParamsString: searchParams.toString(),
      },
      type: "module",
    });

    worker.on("message", (message) => {
      if (typeof message === "string" && message.startsWith("log")) {
        console.log(message);
      } else if (message.msg === "selectStream:enqueue") {
        enqueueHandler(message.record);
      } else if (message.msg === "selectStream:close") {
        closeHandler();
      }
    });

    worker.on("exit", () => {
      streamWorker = undefined;
    });

    streamWorker = worker;
  }

  async queryOptions(branch) {
    const searchParams = new URLSearchParams();

    searchParams.set("_", branch);

    return runWorker({
      msg: "select",
      dir: this.dir,
      searchParamsString: searchParams.toString(),
    });
  }

  async updateRecord(record) {
    await runWorker({
      msg: "update",
      dir: this.dir,
      record,
    });
  }

  async deleteRecord(record) {
    await runWorker({
      msg: "delete",
      dir: this.dir,
      record: record,
    });
  }

  async clone(remoteUrl, remoteToken, name) {
    try {
      await pfs.stat(appPath);
    } catch (e) {
      await pfs.mkdir(appPath);
    }

    if (
      (await pfs.readdir(appPath)).some((repo) =>
        new RegExp(`^${this.uuid}`).test(repo),
      )
    ) {
      throw Error(`could not clone, directory ${this.uuid} exists`);
    }

    const dirname = name ? `${this.uuid}-${name}` : this.uuid;

    this.dir = path.join(appPath, dirname);

    const options = {
      fs,
      http,
      dir: this.dir,
      url: remoteUrl,
      singleBranch: true,
    };

    const authPartial = remoteToken
      ? { onAuth: () => ({ username: remoteToken }) }
      : {};

    try {
      await git.clone({ ...options, ...authPartial });
    } catch (e) {
      // if clone failed, remove directory
      await ElectronAPI.rimraf(this.dir);
      throw e;
    }

    await git.setConfig({
      fs,
      dir: this.dir,
      path: "remote.origin.url",
      value: remoteUrl,
    });

    await git.setConfig({
      fs,
      dir: this.dir,
      path: "remote.origin.token",
      value: remoteToken,
    });
  }

  async cloneView(remoteUrl, remoteToken) {
    try {
      await ElectronAPI.rimraf(this.dir);
    } catch {
      // do nothing
    }

    await this.clone(remoteUrl, remoteToken);
  }

  async commit() {
    const { dir } = this;

    const message = [];

    const statusMatrix = await git.statusMatrix({
      fs,
      dir,
    });

    for (let [
      filepath,
      HEADStatus,
      workingDirStatus,
      stageStatus,
    ] of statusMatrix) {
      if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
        await git.resetIndex({
          fs,
          dir,
          filepath,
        });

        [filepath, HEADStatus, workingDirStatus, stageStatus] =
          await git.statusMatrix({
            fs,
            dir,
            filepaths: [filepath],
          });

        if (
          HEADStatus === workingDirStatus &&
          workingDirStatus === stageStatus
        ) {
          // eslint-disable-next-line
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
            filepath,
          });
        } else {
          // stage files in remoteEndpoint as LFS pointers
          if (filepath.startsWith(lfsDir)) {
            const { addLFS } = await import("./lfs.mjs");

            await addLFS({
              fs,
              dir,
              filepath,
            });
          } else {
            await git.add({
              fs,
              dir,
              filepath,
            });
          }

          if (HEADStatus === 1) {
            status = "modified";
          } else {
            status = "added";
          }
        }

        message.push(`${filepath} ${status}`);
      }
    }

    if (message.length !== 0) {
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

  // called without "files" on push
  async uploadBlobsLFS(remote, files) {
    const { pointsToLFS, uploadBlobs } = await import("@fetsorn/isogit-lfs");

    const [remoteUrl, remoteToken] = await this.getRemote(remote);

    let assets;

    // if no files are specified
    // for every file in remoteEndpoint/
    // if file is not LFS pointer,
    // upload file to remote
    if (files === undefined) {
      const filenames = await pfs.readdir(`${this.dir}/${lfsDir}/`);

      assets = (
        await Promise.all(
          filenames.map(async (filename) => {
            const file = await this.fetchFile(path.join(lfsDir, filename));

            if (!pointsToLFS(file)) {
              return file;
            }

            return undefined;
          }),
        )
      ).filter(Boolean);
    } else {
      assets = files;
    }

    await uploadBlobs(
      {
        url: remoteUrl,
        auth: {
          username: remoteToken,
          password: remoteToken,
        },
      },
      assets,
    );
  }

  async push(remote) {
    const [remoteUrl, remoteToken] = await this.getRemote(remote);

    try {
      await this.uploadBlobsLFS(remote);
    } catch (e) {
      console.log("uploadBlobs failed", e);
    }

    await git.push({
      fs,
      http,
      force: true,
      dir: this.dir,
      url: remoteUrl,
      onAuth: () => ({
        username: remoteToken,
      }),
    });
  }

  async pull(remote) {
    const [remoteUrl, remoteToken] = await this.getRemote(remote);

    // fastForward instead of pull
    // https://github.com/isomorphic-git/isomorphic-git/issues/1073
    await git.fastForward({
      fs,
      http,
      dir: this.dir,
      url: remoteUrl,
      onAuth: () => ({
        username: remoteToken,
      }),
    });
  }

  async ensure(name) {
    try {
      await pfs.stat(appPath);
    } catch {
      await pfs.mkdir(appPath);
    }

    const dirname = name ? `${this.uuid}-${name}` : `${this.uuid}`;

    this.dir = path.join(appPath, dirname);

    const { dir } = this;

    const existingRepo = (await pfs.readdir(appPath)).find((repo) =>
      new RegExp(`^${this.uuid}`).test(repo),
    );

    if (existingRepo === undefined) {
      await pfs.mkdir(dir);

      await git.init({ fs, dir, defaultBranch: "main" });
    } else {
      await pfs.rename(path.join(appPath, existingRepo), dir);
    }

    await pfs.writeFile(
      `${dir}/.gitattributes`,
      `${lfsDir}/** filter=lfs diff=lfs merge=lfs -text\n`,
      "utf8",
    );

    await git.setConfig({
      fs,
      dir,
      path: "filter.lfs.clean",
      value: "git-lfs clean -- %f",
    });

    await git.setConfig({
      fs,
      dir,
      path: "filter.lfs.smudge",
      value: "git-lfs smudge -- %f",
    });

    await git.setConfig({
      fs,
      dir,
      path: "filter.lfs.process",
      value: "git-lfs filter-process",
    });

    await git.setConfig({
      fs,
      dir,
      path: "filter.lfs.required",
      value: true,
    });

    await pfs.writeFile(`${dir}/.csvs.csv`, "csvs,0.0.2", "utf8");

    await this.commit();
  }

  static async rimraf(rimrafpath) {
    // TODO: check that rimrafpath has no ".."

    try {
      const stats = await pfs.stat(rimrafpath);

      if (stats.isFile()) {
        await pfs.unlink(rimrafpath);
      } else if (stats.isDirectory()) {
        await pfs.rm(rimrafpath, { recursive: true });
      }
    } catch (e) {
      // console.log(`failed to rimraf ${e}`);
    }
  }

  async ls(lspath) {
    let files;

    try {
      files = await pfs.readdir(lspath);
    } catch {
      throw Error(`can't read ${lspath} to list it`);
    }

    console.log("list ", lspath, ":", files);

    for (const file of files) {
      const filepath = path.join(lspath, file);

      const { type } = await pfs.stat(filepath);

      if (type === "dir") {
        await this.ls(filepath);
      }
    }
  }

  // static async latex() {
  //   const text = generateLatex([]);

  //   const pdfURL = await exportPDF(text);

  //   return pdfURL;
  // }

  async readSchema() {
    if (this.uuid === "root") {
      return schemaRoot;
    }

    const [schemaRecord] = await this.select(new URLSearchParams("?_=_"));

    const branchRecords = await this.select(new URLSearchParams("?_=branch"));

    const schema = branchRecordsToSchema(schemaRecord, branchRecords);

    return schema;
  }

  async readGedcom() {
    const gedcom = await this.readFile("index.ged");

    return gedcom;
  }

  async readIndex() {
    const index = await this.readFile("index.html");

    return index;
  }

  async downloadAsset(content, filename) {
    const file = await dialog.showSaveDialog({
      title: "Select the File Path to save",
      defaultPath: filename,
      buttonLabel: "Save",
      filters: [],
      properties: [],
    });

    if (!file.canceled) {
      await pfs.writeFile(file.filePath.toString(), content);
    }
  }

  async zip() {
    const { default: JsZip } = await import("jszip");

    const zip = new JsZip();

    const addToZip = async (dir, zipDir) => {
      const files = await pfs.readdir(dir);

      for (const filename of files) {
        const filepath = path.join(dir, filename);

        const stats = await pfs.lstat(filepath);

        if (stats.isFile()) {
          const content = await pfs.readFile(filepath);

          zipDir.file(filename, content);
        } else if (stats.isDirectory()) {
          const zipDirNew = zipDir.folder(filename);

          await addToZip(filepath, zipDirNew);
        }
      }
    };

    await addToZip(this.dir, zip);

    zip.generateAsync({ type: "nodebuffer" }).then(async (content) => {
      const file = await dialog.showSaveDialog({
        title: "Select the File Path to save",
        defaultPath: this.uuid,
        buttonLabel: "Save",
        // Restricting the user to only Text Files.
        filters: [
          {
            name: "Zip Files",
            extensions: ["zip"],
          },
        ],
        properties: [],
      });

      if (!file.canceled) {
        await pfs.writeFile(file.filePath.toString(), content);
      }
    });
  }

  // returns Uint8Array file contents
  async fetchAsset(filename) {
    let assetEndpoint;

    let content;

    try {
      assetEndpoint = await git.getConfig({
        fs,
        dir: this.dir,
        path: "asset.path",
      });

      if (assetEndpoint) {
        const assetPath = path.join(assetEndpoint, filename);

        // if URL, try to fetch
        try {
          new URL(assetPath);

          content = await fetch(assetPath);

          return content;
        } catch (e) {
          // do nothing
        }

        // otherwise try to read from fs
        content = await fs.readFileSync(assetPath);

        return content;
      }
    } catch (e) {
      console.log(e);
      // do nothing
    }

    assetEndpoint = path.join(this.dir, lfsDir);

    const assetPath = path.join(assetEndpoint, filename);

    content = await fs.readFileSync(assetPath);

    const { downloadBlobFromPointer, pointsToLFS, readPointer } = await import(
      "@fetsorn/isogit-lfs"
    );

    if (pointsToLFS(content)) {
      const pointer = await readPointer({ dir: this.dir, content });

      const remotes = await this.listRemotes();
      // loop over remotes trying to resolve LFS
      for (const remote of remotes) {
        const [remoteUrl, remoteToken] = await this.getRemote(remote);

        try {
          content = await downloadBlobFromPointer(
            fs,
            {
              http,
              url: remoteUrl,
              auth: {
                username: remoteToken,
                password: remoteToken,
              },
            },
            pointer,
          );

          return content;
        } catch (e) {
          // do nothing
        }
      }
    }

    return content;
  }

  async writeFeed(xml) {
    await this.writeFile("feed.xml", xml);
  }

  async listRemotes() {
    const remotes = await git.listRemotes({
      fs,
      dir: this.dir,
    });

    return remotes.map((r) => r.remote);
  }

  async addRemote(remoteName, remoteUrl, remoteToken) {
    await git.addRemote({
      fs,
      dir: this.dir,
      remote: remoteName,
      url: remoteUrl,
    });

    if (remoteToken) {
      await git.setConfig({
        fs,
        dir: this.dir,
        path: `remote.${remoteName}.token`,
        value: remoteToken,
      });
    }
  }

  // fails at parseConfig with "cannot split null",
  // as if it doesn't find the config
  async getRemote(remoteName) {
    const remoteUrl = await git.getConfig({
      fs,
      dir: this.dir,
      path: `remote.${remoteName}.url`,
    });

    const remoteToken = await git.getConfig({
      fs,
      dir: this.dir,
      path: `remote.${remoteName}.token`,
    });

    return [remoteUrl, remoteToken];
  }

  async addAssetPath(assetPath) {
    await git.setConfig({
      fs,
      dir: this.dir,
      path: "asset.path",
      value: assetPath,
    });
  }

  async listAssetPaths() {
    await git.getConfigAll({
      fs,
      dir: this.dir,
      path: "asset.path",
    });
  }

  static async downloadUrlFromPointer(url, token, pointerInfo) {
    const { downloadUrlFromPointer } = await import("@fetsorn/isogit-lfs");

    return downloadUrlFromPointer({
      http,
      url,
      auth: {
        username: token,
        password: token,
      },
      info: pointerInfo,
    });
  }
}
