import LightningFS from "@isomorphic-git/lightning-fs";
import { ReadableStream as ReadableStreamPolyfill } from "web-streams-polyfill";
import { schemaRoot, recordsToSchema } from "./schema.js";
import { saveAs } from "file-saver";

const fs = new LightningFS("fs");

const pfs = fs.promises;

const lfsDir = "lfs";

// const __BUILD_MODE__ = "browser";

async function runWorker(readFile, searchParams) {
  const worker = new Worker(new URL("./browser.worker.js", import.meta.url), {
    type: "module",
  });

  worker.onmessage = async (message) => {
    switch (message.data.action) {
      case "readFile": {
        try {
          const contents = await readFile(message.data.filepath);

          message.ports[0].postMessage({ result: contents });
        } catch (e) {
          // safari cannot clone the error object, force to string
          message.ports[0].postMessage({ error: `${e}` });
        }

        break;
      }

      default:
      // do nothing
    }
  };

  return new Promise((res, rej) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = ({ data }) => {
      channel.port1.close();

      if (data.error) {
        rej(data.error);
      } else {
        res(data.result);
      }
    };

    worker.postMessage(
      { action: "select", searchParams: searchParams.toString() },
      [channel.port2],
    );
  });
}

export class BrowserAPI {
  uuid;

  constructor(uuid) {
    this.uuid = uuid;
  }

  async dir() {
    return `/${(await pfs.readdir("/")).find((repo) =>
      new RegExp(`^${this.uuid}`).test(repo),
    )}`;
  }

  async helloWorld(someVariable) {
    return `${someVariable} from browser`;
  }

  async fetchFile(filepath) {
    // eslint-disable-next-line
    if (__BUILD_MODE__ === "server") {
      return (await fetch(`/api/${filepath}`)).arrayBuffer();
    }

    const dir = await this.dir();

    // check if path exists in the repo
    const pathElements = dir
      .replace(/^\//, "")
      .split("/")
      .concat(filepath.split("/"));

    let root = "";

    for (let i = 0; i < pathElements.length; i += 1) {
      const pathElement = pathElements[i];

      root += "/";

      const files = await pfs.readdir(root);

      if (files.includes(pathElement)) {
        root += pathElement;
      } else {
        // console.log(
        //   `Cannot load file. Ensure there is a file called ${pathElement} in ${root}.`,
        // );
        // throw Error(
        //   `Cannot load file. Ensure there is a file called ${pathElement} in ${root}.`
        // );
        return undefined;
      }
    }

    const file = await pfs.readFile(`${dir}/${filepath}`);

    return file;
  }

  async readFile(filepath) {
    const file = await this.fetchFile(filepath);

    const restext = new TextDecoder().decode(file);

    return restext;
  }

  async writeFile(filepath, content) {
    // eslint-disable-next-line
    if (__BUILD_MODE__ === "server") {
      await fetch(`/api/${filepath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
        }),
      });

      return;
    }

    const dir = await this.dir();

    // if path doesn't exist, create it
    // split path into array of directory names
    const pathElements = dir
      .replace(/^\//, "")
      .split("/")
      .concat(filepath.split("/"));

    // remove file name
    pathElements.pop();

    let root = "";

    for (let i = 0; i < pathElements.length; i += 1) {
      const pathElement = pathElements[i];

      root += "/";

      const files = await pfs.readdir(root);

      if (!files.includes(pathElement)) {
        // try/catch because csvs can call this in parallel and fail with EEXIST
        try {
          await pfs.mkdir(`${root}/${pathElement}`);
        } catch {
          // do nothing
        }
      } else {
        // console.log(`writeFileBrowser ${root} has ${pathElement}`)
      }

      root += pathElement;
    }

    await pfs.writeFile(`${dir}/${filepath}`, content, "utf8");
  }

  async putAsset(filename, content) {
    // write buffer to assetEndpoint/filename
    const assetEndpoint = `${lfsDir}/${filename}`;

    await this.writeFile(assetEndpoint, content);
  }

  async uploadFile() {
    const input = document.createElement("input");

    input.type = "file";

    input.multiple = "multiple";

    return new Promise((res, rej) => {
      let metadata = [];

      input.onchange = async (e) => {
        for (const file of e.target.files) {
          const fileArrayBuffer = await file.arrayBuffer();

          const hashArrayBuffer = await crypto.subtle.digest(
            "SHA-256",
            fileArrayBuffer,
          );

          const hashByteArray = Array.from(new Uint8Array(hashArrayBuffer));

          const hashHexString = hashByteArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

          const name = file.name.replace(/\.[^/.]+$/, "");

          const extension = /(?:\.([^.]+))?$/.exec(file.name)[1]?.trim();

          const assetname = `${hashHexString}.${extension}`;

          await this.putAsset(assetname, fileArrayBuffer);

          const metadatum = { hash: hashHexString, name, extension };

          metadata.push(metadatum);
        }

        res(metadata);
      };

      input.click();
    });
  }

  async select(searchParams) {
    const overview = await runWorker(this.readFile.bind(this), searchParams);

    return overview;
  }

  async selectStream(searchParams) {
    const browserAPI = this;

    let closeHandler;

    const strm = new ReadableStream({
      start(controller) {
        const worker = new Worker(
          new URL("./browser.worker", import.meta.url),
          { type: "module" },
        );

        closeHandler = () => {
          try {
            controller.close();
          } catch {
            // ignore catch
          }
        };

        worker.onmessage = async (message) => {
          switch (message.data.action) {
            case "readFile": {
              try {
                const contents = await browserAPI.readFile(
                  message.data.filepath,
                );

                message.ports[0].postMessage({ result: contents });
              } catch (e) {
                // safari cannot clone the error object, force to string
                message.ports[0].postMessage({ error: `${e}` });
              }

              break;
            }
            case "write": {
              try {
                controller.enqueue(message.data.record);
              } catch {
                // after stream is interrupted
                // ReadableStreamDefaultController is not in a state where chunk can be enqueued
              }

              break;
            }
            case "close": {
              try {
                controller.close();
              } catch {
                // ignore catch
              }

              break;
            }
            case "error": {
              controller.error(message.data.error);

              break;
            }
            default:
            // do nothing
          }
        };

        const channel = new MessageChannel();

        worker.postMessage(
          { action: "selectStream", searchParams: searchParams.toString() },
          [channel.port2],
        );
      },
    });

    return { strm, closeHandler };
  }

  async updateRecord(record) {
    const { CSVS } = await import("@fetsorn/csvs-js");

    await new CSVS({
      readFile: (filepath) => this.readFile(filepath),
      writeFile: (filepath, content) => this.writeFile(filepath, content),
    }).update(structuredClone(record));
  }

  async deleteRecord(record) {
    const { CSVS } = await import("@fetsorn/csvs-js");

    await new CSVS({
      readFile: (filepath) => this.readFile(filepath),
      writeFile: (filepath, content) => this.writeFile(filepath, content),
    }).delete(structuredClone(record));
  }

  async clone(remoteUrl, remoteToken, name) {
    if (
      (await pfs.readdir("/")).some((repo) =>
        new RegExp(`^${this.uuid}`).test(repo),
      )
    ) {
      throw Error(`could not clone, directory ${this.uuid} exists`);
    }

    const http = await import("isomorphic-git/http/web/index.cjs");

    const dir = `/${this.uuid}-${name}`;

    const options = {
      fs,
      http,
      dir,
      url: remoteUrl,
      singleBranch: true,
    };

    if (remoteToken) {
      options.onAuth = () => ({
        username: remoteToken,
      });
    }

    const { clone, setConfig } = await import("isomorphic-git");

    try {
      await clone(options);
    } catch (e) {
      // if clone failed, remove directory
      await this.rimraf(dir);

      throw e;
    }

    await setConfig({
      fs,
      dir,
      path: "remote.origin.url",
      value: remoteUrl,
    });

    if (remoteToken) {
      await setConfig({
        fs,
        dir,
        path: "remote.origin.token",
        value: remoteToken,
      });
    }
  }

  async commit() {
    // eslint-disable-next-line
    if (__BUILD_MODE__ === "server") {
      await fetch("api/", {
        method: "PUT",
      });

      return;
    }

    const dir = await this.dir();

    const message = [];

    const { statusMatrix, resetIndex, remove, add, commit } = await import(
      "isomorphic-git"
    );

    const matrix = await statusMatrix({
      fs,
      dir,
    });

    for (let [filepath, HEADStatus, workingDirStatus, stageStatus] of matrix) {
      if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
        await resetIndex({
          fs,
          dir,
          filepath,
        });

        [filepath, HEADStatus, workingDirStatus, stageStatus] =
          await statusMatrix({
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

          await remove({
            fs,
            dir,
            filepath,
          });
        } else {
          // stage files in remoteEndpoint as LFS pointers
          if (filepath.startsWith(lfsDir)) {
            const { addLFS } = await import("@fetsorn/isogit-lfs");

            await addLFS({
              fs,
              dir,
              filepath,
            });
          } else {
            await add({
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
      await commit({
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

    const dir = await this.dir();

    let assets;

    // if no files are specified
    // for every file in remoteEndpoint/
    // if file is not LFS pointer,
    // upload file to remote
    if (files === undefined) {
      const filenames = await pfs.readdir(`${dir}/${lfsDir}/`);

      assets = (
        await Promise.all(
          filenames.map(async (filename) => {
            const file = await this.fetchFile(`${lfsDir}/${filename}`);

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
      console.log("api/browser/uploadBlobsLFS failed", e);
    }

    const { push } = await import("isomorphic-git");

    const http = await import("isomorphic-git/http/web/index.cjs");

    const dir = await this.dir();

    const tokenPartial = remoteToken
      ? {
          onAuth: () => ({
            username: remoteToken,
          }),
        }
      : {};

    await push({
      fs,
      http,
      force: true,
      dir,
      url: remoteUrl,
      remote,
      ...tokenPartial,
    });
  }

  async pull(remote) {
    const [remoteUrl, remoteToken] = await this.getRemote(remote);

    // fastForward instead of pull
    // https://github.com/isomorphic-git/isomorphic-git/issues/1073
    const { fastForward } = await import("isomorphic-git");

    const http = await import("isomorphic-git/http/web/index.cjs");

    const dir = await this.dir();

    const tokenPartial = remoteToken
      ? {
          onAuth: () => ({
            username: remoteToken,
          }),
        }
      : {};

    await fastForward({
      fs,
      http,
      dir,
      url: remoteUrl,
      remote,
      ...tokenPartial,
    });
  }

  async ensure(name) {
    const dir = `/${this.uuid}${name !== undefined ? `-${name}` : ""}`;

    const { init, setConfig } = await import("isomorphic-git");

    const existingRepo = (await pfs.readdir("/")).find((repo) =>
      new RegExp(`^${this.uuid}`).test(repo),
    );

    if (existingRepo === undefined) {
      await pfs.mkdir(dir);

      await init({ fs, dir, defaultBranch: "main" });
    } else if (`/${existingRepo}` !== dir) {
      await pfs.rename(`/${existingRepo}`, dir);
    }

    await pfs.writeFile(`${dir}/.gitignore`, `.DS_Store`, "utf8");

    await pfs.writeFile(
      `${dir}/.gitattributes`,
      `${lfsDir}/** filter=lfs diff=lfs merge=lfs -text\n`,
      "utf8",
    );

    try {
      await pfs.mkdir(`${dir}/.git`);
    } catch {
      // do nothing
    }

    await pfs.writeFile(`${dir}/.git/config`, "\n", "utf8");

    await setConfig({
      fs,
      dir,
      path: "filter.lfs.clean",
      value: "git-lfs clean -- %f",
    });

    await setConfig({
      fs,
      dir,
      path: "filter.lfs.smudge",
      value: "git-lfs smudge -- %f",
    });

    await setConfig({
      fs,
      dir,
      path: "filter.lfs.process",
      value: "git-lfs filter-process",
    });

    await setConfig({
      fs,
      dir,
      path: "filter.lfs.required",
      value: true,
    });

    await pfs.writeFile(`${dir}/.csvs.csv`, "csvs,0.0.2", "utf8");

    await this.commit();
  }

  async rimraf(rimrafpath) {
    let files;

    try {
      files = await pfs.readdir(rimrafpath);
    } catch {
      throw Error(`can't read ${rimrafpath} to rimraf it`);
    }

    for (const file of files) {
      const filepath = `${rimrafpath}/${file}`;

      const { type } = await pfs.stat(filepath);

      if (type === "file") {
        await pfs.unlink(filepath);
      } else if (type === "dir") {
        await this.rimraf(filepath);
      }
    }

    await pfs.rmdir(rimrafpath);
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
      const filepath = `${lspath}/${file}`;

      const { type } = await pfs.stat(filepath);

      if (type === "dir") {
        await this.ls(filepath);
      }
    }
  }

  async readSchema() {
    if (this.uuid === "root") {
      return schemaRoot;
    }

    const [schemaRecord] = await this.select(new URLSearchParams("?_=_"));

    const branchRecords = await this.select(new URLSearchParams("?_=branch"));

    const schema = recordsToSchema(schemaRecord, branchRecords);

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

  downloadAsset(content, filename) {
    saveAs(content, filename);
  }

  async zip() {
    const { default: JsZip } = await import("jszip");

    const zip = new JsZip();

    const addToZip = async (dir, zipDir) => {
      const files = await pfs.readdir(dir);

      for (const file of files) {
        const filepath = `${dir}/${file}`;

        const { type: filetype } = await pfs.lstat(filepath);

        if (filetype === "file") {
          const content = await pfs.readFile(filepath);

          zipDir.file(file, content);
        } else if (filetype === "dir") {
          const zipDirNew = zipDir.folder(file);

          await addToZip(filepath, zipDirNew);
        }
      }
    };

    const dir = await this.dir();

    await addToZip(dir, zip);

    const { saveAs } = await import("file-saver");

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "archive.zip");
    });
  }

  // returns Uint8Array file contents
  async fetchAsset(filename) {
    let assetEndpoint;

    let content;

    const dir = await this.dir();

    try {
      const { getConfig } = await import("isomorphic-git");

      assetEndpoint = await getConfig({
        fs,
        dir,
        path: "asset.path",
      });

      if (assetEndpoint) {
        const assetPath = `${assetEndpoint}/${filename}`;

        // if URL, try to fetch
        try {
          new URL(assetPath);

          content = await fetch(assetPath);

          return content;
        } catch (e) {
          // do nothing
        }

        // otherwise try to read from fs
        content = await fs.promises.readFile(assetPath);

        return content;
      }
    } catch (e) {
      // do nothing
    }

    assetEndpoint = `${dir}/${lfsDir}`;

    const assetPath = `${assetEndpoint}/${filename}`;

    content = await fs.promises.readFile(assetPath);

    const { downloadBlobFromPointer, pointsToLFS, readPointer } = await import(
      "@fetsorn/isogit-lfs"
    );

    const contentUTF8 = new TextDecoder().decode(content);

    if (pointsToLFS(contentUTF8)) {
      const pointer = await readPointer({ dir, content: contentUTF8 });

      const remotes = await this.listRemotes();

      const http = await import("isomorphic-git/http/web/index.cjs");

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
    const { listRemotes } = await import("isomorphic-git");

    const dir = await this.dir();

    const remotes = await listRemotes({
      fs,
      dir,
    });

    return remotes.map((r) => r.remote);
  }

  async addRemote(remoteName, remoteUrl, remoteToken) {
    const { addRemote: addRemoteGit, setConfig } = await import(
      "isomorphic-git"
    );

    const dir = await this.dir();

    await addRemoteGit({
      fs,
      dir,
      remote: remoteName,
      url: remoteUrl,
    });

    if (remoteToken) {
      await setConfig({
        fs,
        dir,
        path: `remote.${remoteName}.token`,
        value: remoteToken,
      });
    }
  }

  async getRemote(remoteName) {
    const { getConfig } = await import("isomorphic-git");

    const dir = await this.dir();

    const remoteUrl = await getConfig({
      fs,
      dir,
      path: `remote.${remoteName}.url`,
    });

    const remoteToken = await getConfig({
      fs,
      dir,
      path: `remote.${remoteName}.token`,
    });

    return [remoteUrl, remoteToken];
  }

  async addAssetPath(assetPath) {
    const { setConfig } = await import("isomorphic-git");

    const dir = await this.dir();

    await setConfig({
      fs,
      dir,
      path: "asset.path",
      value: assetPath,
    });
  }

  async listAssetPaths() {
    const { getConfigAll } = await import("isomorphic-git");

    const dir = await this.dir();

    await getConfigAll({
      fs,
      dir,
      path: "asset.path",
    });
  }

  static async downloadUrlFromPointer(url, token, pointerInfo) {
    const http = await import("isomorphic-git/http/web/index.cjs");

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
