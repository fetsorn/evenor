import LightningFS from "@isomorphic-git/lightning-fs";
import git from "isomorphic-git";
import axios from "axios";
import { manifestRoot } from "../../lib/git_template";
import * as csvs from "@fetsorn/csvs-js";

async function fetchDataMetadirBrowser(dir: string, path: string) {
  // check if path exists in the repo
  const path_elements = [dir].concat(path.split("/"));

  // console.log("fetchDataMetadir: path_elements, path", path_elements, path);

  let root = "";

  const fs = new LightningFS("fs");

  const pfs = fs.promises;

  for (let i = 0; i < path_elements.length; i++) {
    const path_element = path_elements[i];

    root += "/";

    const files = await pfs.readdir(root);

    // console.log("fetchDataMetadir: files", root, files);

    if (files.includes(path_element)) {
      root += path_element;

      // console.log(`fetchDataMetadir: ${root} has ${path_element}`);
    } else {
      throw Error(
        `Cannot load file. Ensure there is a file called ${path_element} in ${root}.`
      );
    }
  }

  const file: any = await pfs.readFile("/" + dir + "/" + path);

  const restext = new TextDecoder().decode(file);

  // console.log(restext)

  return restext;
}

export async function fetchDataMetadir(repoRoute: string, path: string) {
  const repoPath = repoRoute === undefined ? "root" : "repos/" + repoRoute;

  try {
    switch (__BUILD_MODE__) {
      case "server":
        return (await fetch("/api/" + path)).text();

      case "electron":
        return await window.electron.fetchDataMetadir(repoPath, path);

      default:
        return await fetchDataMetadirBrowser(repoPath, path);
    }
  } catch {
    throw Error(`Cannot load file. Ensure there is a file ${path}.`);
  }
}

function queryWorkerInit(dir: string) {
  const worker = new Worker(new URL("./worker", import.meta.url));

  async function callback(message: any) {
    // console.log("main thread receives message", message)

    if (message.data.action === "fetch") {
      try {
        // console.log("main thread tries to fetch", message.data.path);

        const contents = await fetchDataMetadir(dir, message.data.path);

        // console.log("main thread returns fetch")

        message.ports[0].postMessage({ result: contents });
      } catch (e) {
        // console.log("main thread errors");

        message.ports[0].postMessage({ error: e });
      }
    }

    if (message.data.action === "grep") {
      try {
        const wasm = await import("@fetsorn/wasm-grep");

        // console.log("main thread tries to fetch", message.data.path);

        const contents = await wasm.grep(
          message.data.contentFile,
          message.data.patternFile
        );

        // console.log("main thread returns fetch")

        message.ports[0].postMessage({ result: contents });
      } catch (e) {
        // console.log("main thread errors");

        message.ports[0].postMessage({ error: e });
      }
    }
  }

  worker.onmessage = callback;

  const queryMetadir =
    __BUILD_MODE__ === "server"
      ? async (searchParams: URLSearchParams) => {
          const response = await fetch("/query?" + searchParams.toString());

          return response.json();
        }
      : (searchParams: URLSearchParams) =>
          new Promise((res, rej) => {
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
              { action: "query", searchParams: searchParams.toString() },

              [channel.port2]
            );
          });

  return { queryMetadir };
}

export async function gitcommit(repo: string) {
  // console.log("commit");

  const fs = new LightningFS("fs");

  if (__BUILD_MODE__ === "server") {
    try {
      await axios.put("api/");
    } catch (e) {
      console.log(e);
    }
  }

  const message = [];

  const statusMatrix: any = await git.statusMatrix({
    fs,
    dir: "/" + repo,
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
        dir: "/" + repo,
        filepath: filePath,
      });

      [filePath, HEADStatus, workingDirStatus, stageStatus] =
        await git.statusMatrix({
          fs,
          dir: "/" + repo,
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
          dir: "/" + repo,
          filepath: filePath,
        });
      } else {
        await git.add({
          fs,
          dir: "/" + repo,
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
      fs: fs,
      dir: "/" + repo,
      author: {
        name: "name",
        email: "name@mail.com",
      },
      message: message.toString(),
    });
  }
}

async function createRootBrowser() {
  const fs = new LightningFS("fs");

  const pfs = fs.promises;

  const repo = "root";

  const repoDir = "/" + repo;

  if ((await pfs.readdir("/")).includes(repo)) {
    console.log("repo exists");
  } else {
    await pfs.mkdir(repoDir);

    await git.init({ fs: fs, dir: repoDir });

    await pfs.mkdir(repoDir + "/metadir");

    await pfs.writeFile(repoDir + "/metadir.json", manifestRoot, "utf8");

    await pfs.mkdir(repoDir + "/metadir/props");

    await pfs.mkdir(repoDir + "/metadir/props/reponame");

    await pfs.writeFile(
      repoDir + "/metadir/props/reponame/index.csv",
      "",
      "utf8"
    );

    await pfs.mkdir(repoDir + "/metadir/props/schema");

    await pfs.writeFile(
      repoDir + "/metadir/props/schema/index.csv",
      "",
      "utf8"
    );

    await gitcommit(repo);
  }
}

async function createRoot() {
  try {
    switch (__BUILD_MODE__) {
      case "electron":
        await window.electron.gitCreate("root");

      default:
        await createRootBrowser();
    }
  } catch (e) {
    throw Error(`Could not create git repo` + e);
  }
}

export async function ensureRoot() {
  const fs = new LightningFS("fs", { wipe: true } as any);

  const pfs = fs.promises;

  const files = await pfs.readdir("/");

  console.log(files);

  if (!files.includes("root")) {
    await createRoot();
  }
}

export async function rimraf(path: string) {
  const pfs = new LightningFS("fs").promises;

  if (__BUILD_MODE__ === "electron") {
    try {
      await window.electron.rimraf(path);
    } catch {
      throw Error(`Could not rimraf ${path}`);
    }
  } else {
    console.log("rimraf");

    let files;

    try {
      files = await pfs.readdir(path);
    } catch {
      throw Error(`can't read ${path} to rimraf it`);
    }
    console.log("rimfraf", files);
    for (const file of files) {
      const filepath = path + "/" + file;

      const { type } = await pfs.stat(filepath);

      // console.log(`${filepath} is ${type}`);

      if (type === "file") {
        // console.log("unlink", filepath);

        await pfs.unlink(filepath);
      } else if (type === "dir") {
        await rimraf(filepath);
      }
    }

    // console.log("rmdir", path);

    await pfs.rmdir(path);
  }
}

export async function searchRepo(dir: string, search: any): Promise<any> {
  const searchParams = new URLSearchParams(search);

  const queryWorker = queryWorkerInit(dir);

  const overview = await queryWorker.queryMetadir(searchParams);

  return overview;
}

export async function fetchSchema(dir: string): Promise<any> {
  const schemaFile = await fetchDataMetadir(dir, "metadir.json");

  const schema = JSON.parse(schemaFile);

  return schema;
}

export async function uploadFile(dir: string, file: File) {
  if (__BUILD_MODE__ === "server") {
    const form = new FormData();

    form.append("file", file);

    await axios.post("/upload", form);
  } else {
    const pfs = new LightningFS("fs").promises;

    const root = "/";

    const rootFiles = await pfs.readdir("/");

    const repoDir = root + dir;

    if (!rootFiles.includes(dir)) {
      await pfs.mkdir(repoDir);
    }

    const repoFiles = await pfs.readdir(repoDir);

    const local = "local";

    const localDir = repoDir + "/" + local;

    if (!repoFiles.includes(local)) {
      await pfs.mkdir(localDir);
    }

    const localFiles = await pfs.readdir(localDir);

    const filename = file.name;

    const filepath = localDir + "/" + filename;

    if (!localFiles.includes(filename)) {
      const buf: any = await file.arrayBuffer();

      await pfs.writeFile(filepath, buf);
    }
  }
}

export function updateOverview(overview: any, entryNew: any) {
  if (overview.find((e: any) => e.UUID === entryNew.UUID)) {
    return overview.map((e: any) => {
      if (e.UUID === entryNew.UUID) {
        return entryNew;
      } else {
        return e;
      }
    });
  } else {
    return overview.concat([entryNew]);
  }
}

export async function editEntry(repoRoute: string, entry: any) {
  await csvs.editEvent(entry, {
    fetch: (path: string) => fetchDataMetadir(repoRoute, path),
    write: (path: string, content: string) =>
      writeDataMetadir(repoRoute, path, content),
    random: () => crypto.randomUUID(),
  });
}

async function writeDataMetadirBrowser(
  dir: string,
  path: string,
  content: string
) {
  // if path doesn't exist, create it
  // split path into array of directory names
  const path_elements = [dir].concat(path.split("/"));

  // console.log(path_elements, path)

  // remove file name
  path_elements.pop();

  let root = "";

  const fs = new LightningFS("fs");

  const pfs = fs.promises;

  for (let i = 0; i < path_elements.length; i++) {
    const path_element = path_elements[i];

    root += "/";

    const files = await pfs.readdir(root);

    // console.log(files)

    if (!files.includes(path_element)) {
      // console.log(`creating directory ${path_element} in ${root}`)

      await pfs.mkdir(root + "/" + path_element);
    } else {
      // console.log(`${root} has ${path_element}`)
    }

    root += path_element;
  }

  await pfs.writeFile("/" + dir + "/" + path, content, "utf8");
}

export async function writeDataMetadir(
  repoRoute: string,
  path: string,
  content: string
) {
  // console.log("writeDataMetadir");
  const repoPath = repoRoute === undefined ? "root" : "repos/" + repoRoute;

  try {
    switch (__BUILD_MODE__) {
      case "server":
        await axios.post("/api/" + path, {
          content,
        });

      case "electron":
        await window.electron.writeDataMetadir(repoPath, path, content);

      default:
        await writeDataMetadirBrowser(repoPath, path, content);
    }
  } catch {
    throw Error(`Cannot write file ${path}.`);
  }
}

export async function deleteEntry(
  repoRoute: string,
  overview: any,
  entry: any
) {
  if (overview.find((e: any) => e.UUID === entry.UUID)) {
    await csvs.deleteEvent(entry.UUID, {
      fetch: (path: string) => fetchDataMetadir(repoRoute, path),
      write: (path: string, content: string) =>
        writeDataMetadir(repoRoute, path, content),
    });

    return overview.filter((e: any) => e.UUID !== entry.UUID);
  } else {
    return overview;
  }
}

async function createRepo(repo: string, schema: string) {
  try {
    switch (__BUILD_MODE__) {
      case "electron":
        // TODO: add schema
        await window.electron.gitCreate(repo);

      default:
        await createRepoBrowser(repo, schema);
    }
  } catch (e) {
    throw Error(`Could not create git repo` + e);
  }
}

export async function updateRepo(entry: any) {
  await ensureRepo(entry.UUID, entry.SCHEMA);
}

export async function ensureRepo(repo: string, schema: string) {
  const pfs = new LightningFS("fs").promises;

  // try {
  //   await rimraf("/root");
  // } catch (e) {
  //   console.log("rimraf failed");
  // }

  const files = await pfs.readdir("/");

  if (!files.includes(repo)) {
    await createRepo(repo, schema);
  }
}

async function createRepoBrowser(repo: string, schema: string) {
  const fs = new LightningFS("fs");

  const pfs = fs.promises;

  const repoDir = "/" + repo;

  if ((await pfs.readdir("/")).includes(repo)) {
    console.log("repo exists");
  } else {
    await pfs.mkdir(repoDir);

    await git.init({ fs: fs, dir: repoDir });

    await pfs.mkdir(repoDir + "/metadir");

    await pfs.writeFile(repoDir + "/metadir.json", schema, "utf8");

    await gitcommit(repo);
  }
}
