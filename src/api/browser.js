import LightningFS from "@isomorphic-git/lightning-fs";
import { ReadableStream as ReadableStreamPolyfill } from "web-streams-polyfill";
import { saveAs } from "file-saver";

const fs = new LightningFS("fs");

fs.createReadStream = (filepath) =>
  new ReadableStream({
    async start(controller) {
      const contents = await fs.promises.readFile(filepath);

      controller.enqueue(contents);

      controller.close();
    },
  });

fs.createWriteStream = (filepath) => {
  let contents = "";

  return new WritableStream({
    write(character) {
      contents += character;
    },

    async close() {
      await fs.promises.writeFile(filepath, contents);
    },
  });
};

fs.promises.mkdtemp = async (filepath) => {
  const randomString = Math.floor(Math.random() * 10000).toString();

  const tmpdir = filepath + randomString;

  try {
    await fs.promises.mkdir(tmpdir);
  } catch {
    // do nothing
  }

  return tmpdir;
};

fs.promises.appendFile = async (filepath, tail) => {
  try {
    const contents = await fs.promises.readFile(filepath, "utf8");

    const contentsNew = contents + tail;

    await fs.promises.writeFile(filepath, contentsNew);
  } catch {
    await fs.promises.writeFile(filepath, tail);
  }
};

const lfsDir = "lfs";

// const __BUILD_MODE__ = "browser";

export async function findDir(uuid) {
  return `/${(await fs.promises.readdir("/")).find((repo) =>
    new RegExp(`^${uuid}`).test(repo),
  )}`;
}

export async function helloWorld(uuid, someVariable) {
  return `${someVariable} from browser`;
}

export async function fetchFile(uuid, filepath) {
  const dir = await findDir(uuid);

  // check if path exists in the repo
  const pathElements = dir
    .replace(/^\//, "")
    .split("/")
    .concat(filepath.split("/"));

  let root = "";

  for (let i = 0; i < pathElements.length; i += 1) {
    const pathElement = pathElements[i];

    root += "/";

    const files = await fs.promises.readdir(root);

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

  const file = await fs.promises.readFile(`${dir}/${filepath}`);

  return file;
}

export async function readFile(uuid, filepath) {
  const file = await fetchFile(uuid, filepath);

  const restext = new TextDecoder().decode(file);

  return restext;
}

export async function writeFile(uuid, filepath, content) {
  const dir = await findDir(uuid);

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

    const files = await fs.promises.readdir(root);

    if (!files.includes(pathElement)) {
      // try/catch because csvs can call this in parallel and fail with EEXIST
      try {
        await fs.promises.mkdir(`${root}/${pathElement}`);
      } catch {
        // do nothing
      }
    } else {
      // console.log(`writeFileBrowser ${root} has ${pathElement}`)
    }

    root += pathElement;
  }

  await fs.promises.writeFile(`${dir}/${filepath}`, content, "utf8");
}

export async function putAsset(uuid, filename, content) {
  // write buffer to assetEndpoint/filename
  const assetEndpoint = `${lfsDir}/${filename}`;

  await writeFile(uuid, assetEndpoint, content);
}

export async function uploadFile(uuid) {
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

        await putAsset(uuid, assetname, fileArrayBuffer);

        const metadatum = { hash: hashHexString, name, extension };

        metadata.push(metadatum);
      }

      res(metadata);
    };

    input.click();
  });
}

export async function select(uuid, query) {
  const csvs = await import("@fetsorn/csvs-js");

  const dir = await findDir(uuid);

  const overview = await csvs.selectRecord({
    fs,
    dir,
    query,
  });

  return overview;
}

export async function selectStream(uuid, query) {
  const csvs = await import("@fetsorn/csvs-js");

  const dir = await findDir(uuid);

  // TODO terminate previous stream
  const selectStream = csvs.selectRecordStream({
    fs,
    dir,
    query,
  });

  const queryStream = new ReadableStream({
    start(controller) {
      controller.enqueue(query);

      controller.close();
    },
  });

  const strm = queryStream.pipeThrough(selectStream);

  // let closeHandler = () => strm.cancel();
  let closeHandler = () => {};

  return { strm, closeHandler };
}

export async function updateRecord(uuid, record) {
  const csvs = await import("@fetsorn/csvs-js");

  const dir = await findDir(uuid);

  await csvs.updateRecord({
    fs,
    dir,
    query: record,
  });
}

export async function deleteRecord(uuid, record) {
  const csvs = await import("@fetsorn/csvs-js");

  await csvs.deleteRecord({
    fs,
    dir: await findDir(uuid),
    query: record,
  });
}

export async function clone(uuid, remoteUrl, remoteToken, name) {
  if (
    (await fs.promises.readdir("/")).some((repo) =>
      new RegExp(`^${uuid}`).test(repo),
    )
  ) {
    throw Error(`could not clone, directory ${uuid} exists`);
  }

  const http = await import("isomorphic-git/http/web/index.cjs");

  const dir = `/${uuid}-${name}`;

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

  const git = await import("isomorphic-git");

  try {
    await git.clone(options);
  } catch (e) {
    // if clone failed, remove directory
    await rimraf(dir);

    throw e;
  }

  await git.setConfig({
    fs,
    dir,
    path: "remote.origin.url",
    value: remoteUrl,
  });

  if (remoteToken) {
    await git.setConfig({
      fs,
      dir,
      path: "remote.origin.token",
      value: remoteToken,
    });
  }
}

export async function commit(uuid) {
  const dir = await findDir(uuid);

  const message = [];

  const git = await import("isomorphic-git");

  const matrix = await git.statusMatrix({
    fs,
    dir,
  });

  for (let [filepath, HEADStatus, workingDirStatus, stageStatus] of matrix) {
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

      if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
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
          const lfs = await import("@fetsorn/isogit-lfs");

          await lfs.addLFS({
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
export async function uploadBlobsLFS(uuid, remote, files) {
  const lfs = await import("@fetsorn/isogit-lfs");

  const [remoteUrl, remoteToken] = await getRemote(remote);

  const dir = await findDir(uuid);

  let assets;

  // if no files are specified
  // for every file in remoteEndpoint/
  // if file is not LFS pointer,
  // upload file to remote
  if (files === undefined) {
    const filenames = await fs.promises.readdir(`${dir}/${lfsDir}/`);

    assets = (
      await Promise.all(
        filenames.map(async (filename) => {
          const file = await fetchFile(uuid, `${lfsDir}/${filename}`);

          if (!lfs.pointsToLFS(file)) {
            return file;
          }

          return undefined;
        }),
      )
    ).filter(Boolean);
  } else {
    assets = files;
  }

  await lfs.uploadBlobs(
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

export async function push(uuid, remote) {
  const [remoteUrl, remoteToken] = await getRemote(remote);

  try {
    await uploadBlobsLFS(remote);
  } catch (e) {
    console.log("api/browser/uploadBlobsLFS failed", e);
  }

  const git = await import("isomorphic-git");

  const http = await import("isomorphic-git/http/web/index.cjs");

  const dir = await findDir(uuid);

  const tokenPartial = remoteToken
    ? {
        onAuth: () => ({
          username: remoteToken,
        }),
      }
    : {};

  await git.push({
    fs,
    http,
    force: true,
    dir,
    url: remoteUrl,
    remote,
    ...tokenPartial,
  });
}

export async function pull(uuid, remote) {
  const [remoteUrl, remoteToken] = await getRemote(remote);

  // fastForward instead of pull
  // https://github.com/isomorphic-git/isomorphic-git/issues/1073
  const git = await import("isomorphic-git");

  const http = await import("isomorphic-git/http/web/index.cjs");

  const dir = await findDir(uuid);

  const tokenPartial = remoteToken
    ? {
        onAuth: () => ({
          username: remoteToken,
        }),
      }
    : {};

  await git.fastForward({
    fs,
    http,
    dir,
    url: remoteUrl,
    remote,
    ...tokenPartial,
  });
}

export async function ensure(uuid, name) {
  const dir = `/${uuid}${name !== undefined ? `-${name}` : ""}`;

  const git = await import("isomorphic-git");

  const existingRepo = (await fs.promises.readdir("/")).find((repo) =>
    new RegExp(`^${uuid}`).test(repo),
  );

  if (existingRepo === undefined) {
    await fs.promises.mkdir(dir);

    await git.init({ fs, dir, defaultBranch: "main" });
  } else if (`/${existingRepo}` !== dir) {
    await fs.promises.rename(`/${existingRepo}`, dir);
  }

  await fs.promises.writeFile(`${dir}/.gitignore`, `.DS_Store`, "utf8");

  await fs.promises.writeFile(
    `${dir}/.gitattributes`,
    `${lfsDir}/** filter=lfs diff=lfs merge=lfs -text\n`,
    "utf8",
  );

  try {
    await fs.promises.mkdir(`${dir}/.git`);
  } catch {
    // do nothing
  }

  await fs.promises.writeFile(`${dir}/.git/config`, "\n", "utf8");

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

  await fs.promises.writeFile(`${dir}/.csvs.csv`, "csvs,0.0.2", "utf8");

  await commit(uuid);
}

export async function rimraf(uuid, rimrafpath) {
  let files;

  try {
    files = await fs.promises.readdir(rimrafpath);
  } catch {
    throw Error(`can't read ${rimrafpath} to rimraf it`);
  }

  for (const file of files) {
    const filepath = `${rimrafpath}/${file}`;

    const { type } = await fs.promises.stat(filepath);

    if (type === "file") {
      await fs.promises.unlink(filepath);
    } else if (type === "dir") {
      await rimraf(filepath);
    }
  }

  await fs.promises.rmdir(rimrafpath);
}

export async function ls(uuid, lspath) {
  let files;

  try {
    files = await fs.promises.readdir(lspath);
  } catch {
    throw Error(`can't read ${lspath} to list it`);
  }

  console.log("list ", lspath, ":", files);

  for (const file of files) {
    const filepath = `${lspath}/${file}`;

    const { type } = await fs.promises.stat(filepath);

    if (type === "dir") {
      await ls(filepath);
    }
  }
}

export function downloadAsset(uuid, content, filename) {
  saveAs(content, filename);
}

export async function zip() {
  const { default: JsZip } = await import("jszip");

  const zip = new JsZip();

  const addToZip = async (dir, zipDir) => {
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
      const filepath = `${dir}/${file}`;

      const { type: filetype } = await fs.promises.lstat(filepath);

      if (filetype === "file") {
        const content = await fs.promises.readFile(filepath);

        zipDir.file(file, content);
      } else if (filetype === "dir") {
        const zipDirNew = zipDir.folder(file);

        await addToZip(filepath, zipDirNew);
      }
    }
  };

  const dir = await findDir(uuid);

  await addToZip(dir, zip);

  const { saveAs } = await import("file-saver");

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, "archive.zip");
  });
}

// returns Uint8Array file contents
export async function fetchAsset(uuid, filename) {
  let assetEndpoint;

  let content;

  const dir = await findDir(uuid);

  try {
    const git = await import("isomorphic-git");

    assetEndpoint = await git.getConfig({
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

  const lfs = await import("@fetsorn/isogit-lfs");

  const contentUTF8 = new TextDecoder().decode(content);

  if (lfs.pointsToLFS(contentUTF8)) {
    const pointer = await lfs.readPointer({ dir, content: contentUTF8 });

    const remotes = await listRemotes(uuid);

    const http = await import("isomorphic-git/http/web/index.cjs");

    // loop over remotes trying to resolve LFS
    for (const remote of remotes) {
      const [remoteUrl, remoteToken] = await getRemote(remote);

      try {
        content = await lfs.downloadBlobFromPointer(
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

export async function listRemotes(uuid) {
  const git = await import("isomorphic-git");

  const dir = await findDir(uuid);

  const remotes = await git.listRemotes({
    fs,
    dir,
  });

  return remotes.map((r) => r.remote);
}

export async function addRemote(uuid, remoteName, remoteUrl, remoteToken) {
  const git = await import("isomorphic-git");

  const dir = await findDir(uuid);

  await git.addRemote({
    fs,
    dir,
    remote: remoteName,
    url: remoteUrl,
  });

  if (remoteToken) {
    await git.setConfig({
      fs,
      dir,
      path: `remote.${remoteName}.token`,
      value: remoteToken,
    });
  }
}

export async function getRemote(uuid, remoteName) {
  const git = await import("isomorphic-git");

  const dir = await findDir(uuid);

  const remoteUrl = await git.getConfig({
    fs,
    dir,
    path: `remote.${remoteName}.url`,
  });

  const remoteToken = await git.getConfig({
    fs,
    dir,
    path: `remote.${remoteName}.token`,
  });

  return [remoteUrl, remoteToken];
}

export async function addAssetPath(uuid, assetPath) {
  const git = await import("isomorphic-git");

  const dir = await findDir(uuid);

  await git.setConfig({
    fs,
    dir,
    path: "asset.path",
    value: assetPath,
  });
}

export async function listAssetPaths(uuid) {
  const git = await import("isomorphic-git");

  const dir = await findDir(uuid);

  await git.getConfigAll({
    fs,
    dir,
    path: "asset.path",
  });
}

export async function downloadUrlFromPointer(url, token, pointerInfo) {
  const http = await import("isomorphic-git/http/web/index.cjs");

  const lfs = await import("@fetsorn/isogit-lfs");

  return lfs.downloadUrlFromPointer({
    http,
    url,
    auth: {
      username: token,
      password: token,
    },
    info: pointerInfo,
  });
}

export default {
  findDir,
  fetchFile,
  readFile,
  writeFile,
  putAsset,
  uploadFile,
  select,
  selectStream,
  updateRecord,
  deleteRecord,
  clone,
  commit,
  uploadBlobsLFS,
  push,
  pull,
  ensure,
  rimraf,
  ls,
  downloadAsset,
  zip,
  fetchAsset,
  listRemotes,
  addRemote,
  getRemote,
  addAssetPath,
  listAssetPaths,
  downloadUrlFromPointer,
};
