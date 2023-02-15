import LightningFS from "@isomorphic-git/lightning-fs";
import axios from "axios";
import * as csvs from "@fetsorn/csvs-js";
import { digestMessage } from "@fetsorn/csvs-js";
import { deepClone } from ".";

// if (typeof crypto === 'undefined')
//   var crypto = require('crypto');

if (!('randomUUID' in crypto))
  // https://stackoverflow.com/a/2117523/2800218
  // LICENSE: https://creativecommons.org/licenses/by-sa/4.0/legalcode
  crypto.randomUUID = function randomUUID() {
    return (
      <any>[1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,
      (c: any) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  };

async function fetchDataMetadirBrowser(dir: string, path: string) {
  // check if path exists in the repo
  const path_elements = dir.split("/").concat(path.split("/"));
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
      // console.log(
      //   `Cannot load file. Ensure there is a file called ${path_element} in ${root}.`
      // );
      return undefined
      // throw Error(
      //   `Cannot load file. Ensure there is a file called ${path_element} in ${root}.`
      // );
    }
  }

  const file: any = await pfs.readFile("/" + dir + "/" + path);

  const restext = new TextDecoder().decode(file);

  // console.log(restext)

  return restext;
}

export async function fetchDataMetadir(repoRoute: string, path: string) {
  try {
    switch (__BUILD_MODE__) {
    case "server":
      return (await fetch("/api/" + path)).text();

    case "electron":
      return await window.electron.fetchDataMetadir(repoRoute, path);

    default:
      return await fetchDataMetadirBrowser(repoRoute, path);
    }
  } catch (e) {
    console.log(`Cannot load file. Ensure there is a file ${path}. ${repoRoute} ${path} ${e}`);
    // throw Error(`Cannot load file. Ensure there is a file ${path}. ${repoRoute} ${path} ${e}`);
  }
}

function queryWorkerInit(dir: string) {
  const worker = new Worker(new URL("./worker", import.meta.url));

  async function callback(message: any) {
    // console.log("main thread receives message", message);

    if (message.data.action === "fetch") {
      try {
        // console.log("main thread tries to fetch", message.data.path);

        const contents = await fetchDataMetadir(dir, message.data.path);

        // console.log("main thread returns fetch");

        message.ports[0].postMessage({ result: contents });
      } catch (e) {
        // console.log("main thread errors", e);

        // safari cannot clone the error object, force to string
        message.ports[0].postMessage({ error: `${e}` });
      }
    }

    if (message.data.action === "grep") {
      try {
        const wasm = await import("@fetsorn/wasm-grep");

        // console.log("main thread tries to fetch", message.data.path);

        const contents = await wasm.grep(
          message.data.contentFile,
          message.data.patternFile,
          message.data.isInverted ?? false
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
      ? async (searchParams: URLSearchParams, base = undefined as any) => {
        const response = await fetch("/query?" + searchParams.toString());

        return response.json();
      }
      : (searchParams: URLSearchParams, base = undefined as any) =>
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
            { action: "query", searchParams: searchParams.toString(), base },
            [channel.port2]
          );
        });

  return { queryMetadir };
}

async function writeDataMetadirBrowser(
  dir: string,
  path: string,
  content: string
) {
  // if path doesn't exist, create it
  // split path into array of directory names
  const path_elements = dir.split("/").concat(path.split("/"));

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
  try {
    switch (__BUILD_MODE__) {
    case "server":
      await axios.post("/api/" + path, {
        content,
      });
      break;

    case "electron":
      await window.electron.writeDataMetadir(repoRoute, path, content);
      break;

    default:
      await writeDataMetadirBrowser(repoRoute, path, content);
    }
  } catch {
    throw Error(`Cannot write file ${path}.`);
  }
}

export async function searchRepo(dir: string, searchParams: URLSearchParams, base = undefined as any): Promise<any> {
  const queryWorker = queryWorkerInit(dir);

  const overview = await queryWorker.queryMetadir(searchParams, base);

  return overview;
}

export async function fetchSchema(dir: string): Promise<any> {
  const schemaFile = await fetchDataMetadir(dir, "metadir.json");

  const schema = JSON.parse(schemaFile);

  return schema;
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
  await (new csvs.Entry({
    entry,
    readFile: (path: string) => fetchDataMetadir(repoRoute, path),
    writeFile: (path: string, content: string) =>
      writeDataMetadir(repoRoute, path, content),
    randomUUID: () => crypto.randomUUID(),
  })).update();
}

export async function deleteEntry(
  repoRoute: string,
  overview: any,
  entry: any
) {
  await (new csvs.Entry({
    entry,
    readFile: (path: string) => fetchDataMetadir(repoRoute, path),
    writeFile: (path: string, content: string) =>
      writeDataMetadir(repoRoute, path, content),
  })).delet();

  return overview.filter((e: any) => e.UUID !== entry.UUID);
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

export async function addField(schema: any, entryOriginal: any, branch: string) {
  const entry = deepClone(entryOriginal);

  let value;

  if (schema[branch].type === "object" || schema[branch].type === "array") {
    const obj: any = {};

    const uuid = await digestMessage(crypto.randomUUID());

    obj['|'] = branch;

    obj.UUID = uuid;

    if (schema[branch].type === "array") {
      obj.items = []
    }

    value = obj;
  } else {
    value = ''
  }
  const base = entry['|']

  const { trunk } = schema[branch];

  if (trunk !== base && branch !== base) {
    return;
  }

  if (schema[base].type === "array") {
    if (entry.items === undefined) {
      entry.items = [];
    }

    entry.items.push({ ...value });
  } else {
    entry[branch] = value;
  }
  return entry;
}

// TODO: set default values for required fields
export async function createEntry(schema: any, base: string) {
  const entry: Record<string, any> = {};

  entry.UUID = await digestMessage(crypto.randomUUID());

  entry['|'] = base;

  if (schema[base].type === 'array') {
    entry.items = [];
  }

  return entry;
}

// pick a param to group data by
export function getDefaultGroupBy(schema: any, data: any, searchParams: URLSearchParams) {
  // fallback to groupBy param from the search query
  if (searchParams.has("groupBy")) {
    const groupBy = searchParams.get("groupBy");

    return groupBy;
  }

  let groupBy;

  const car = data[0] ?? {};

  // fallback to first date param present in data
  groupBy = Object.keys(schema).find((branch: any) => {
    return (
      schema[branch].type === "date" &&
      Object.prototype.hasOwnProperty.call(car, branch)
    );
  });

  // fallback to first param present in data
  if (!groupBy) {
    groupBy = Object.keys(schema).find((branch: any) => {
      return Object.prototype.hasOwnProperty.call(car, branch);
    });
  }

  // fallback to first date param present in schema
  if (!groupBy) {
    groupBy = Object.keys(schema).find(
      (branch: any) => schema[branch].type === "date"
    );
  }

  // fallback to first param present in schema
  if (!groupBy) {
    groupBy = Object.keys(schema)[0];
  }

  // unreachable with a valid scheme
  if (!groupBy) {
    throw Error("failed to find default groupBy in the schema");
  }

  return groupBy;
}

export async function getRepoSettings(repoRoute: string) {
  const repoRouteRoot = "store/root";

  const searchParams = new URLSearchParams();

  const pathname = repoRoute.replace(/^repos\//, '')

  searchParams.set("reponame", pathname);

  // query root db to get entry with repo settings
  const overview = await searchRepo(repoRouteRoot, searchParams);

  const entry = overview[0];

  return entry
}
