import LightningFS from "@isomorphic-git/lightning-fs";
import axios from "axios";
import * as csvs from "@fetsorn/csvs-js";
import { digestMessage } from "@fetsorn/csvs-js";

async function fetchDataMetadirBrowser(dir: string, path: string) {
  // check if path exists in the repo
  const path_elements = dir.split("/").concat(path.split("/"));

  console.log("fetchDataMetadir: path_elements, path", path_elements, path);

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
  const repoPath = repoRoute === undefined ? "store/root" : `repos/${repoRoute}`;

  try {
    switch (__BUILD_MODE__) {
      case "server":
        return (await fetch("/api/" + path)).text();

      case "electron":
        return await window.electron.fetchDataMetadir(repoPath, path);

      default:
        return await fetchDataMetadirBrowser(repoPath, path);
    }
  } catch (e) {
    throw Error(`Cannot load file. Ensure there is a file ${path}. ${repoRoute} ${path} ${e}`);
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
  const repoPath = repoRoute === undefined ? "store/root" : `repos/${repoRoute}`;

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
  await csvs.editEntry(entry, {
    fetch: (path: string) => fetchDataMetadir(repoRoute, path),
    write: (path: string, content: string) =>
      writeDataMetadir(repoRoute, path, content),
    random: () => crypto.randomUUID(),
  });
}

export async function deleteEntry(
  repoRoute: string,
  overview: any,
  entry: any
) {
  if (overview.find((e: any) => e.UUID === entry.UUID)) {
    await csvs.deleteEntry(entry.UUID, {
      fetch: (path: string) => fetchDataMetadir(repoRoute, path),
      write: (path: string, content: string) =>
        writeDataMetadir(repoRoute, path, content),
    });

    return overview.filter((e: any) => e.UUID !== entry.UUID);
  } else {
    return overview;
  }
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

export async function addProp(schema: any, entry: any, label: string) {
  const prop =
    Object.keys(schema).find((p: any) => schema[p].label === label) ?? label;

  const { trunk } = schema[prop];

  if (trunk && schema[trunk].type === "array") {
    const trunkLabel = schema[trunk].label;

    // ensure trunk array
    if (entry[trunkLabel] === undefined) {
      const trunk: any = {};

      const arrayUUID = await digestMessage(crypto.randomUUID());

      trunk.UUID = arrayUUID;

      trunk.items = [];

      entry[trunkLabel] = { ...trunk };
    }

    // assume that array items are always objects
    const obj: any = {};

    const itemUUID = await digestMessage(crypto.randomUUID());

    obj.UUID = itemUUID;

    obj.ITEM_NAME = prop;

    // const fieldLabels = Object.keys(schema)
    //   .filter((p) => schema[p].trunk === prop)
    //   .map((p) => schema[p].label);

    // for (const fieldLabel of fieldLabels) {
    //   obj[fieldLabel] = "";
    // }

    entry[trunkLabel].items.push({ ...obj });
  } else if (trunk && schema[prop].type === "object") {
    const obj: any = {};

    const uuid = await digestMessage(crypto.randomUUID());

    obj.UUID = uuid;

    entry[label] = { ...obj };
  } else {
    entry[label] = "";
  }

  return entry;
}

// TODO: set default values for required fields
export async function createEntry() {
  const entry: Record<string, string> = {};

  entry.UUID = await digestMessage(crypto.randomUUID());

  return entry;
}

// pick a param to group data by
export function getDefaultGroupBy(schema: any, data: any, search: any) {
  // fallback to groupBy param from the search query
  const searchParams = new URLSearchParams(search);

  if (searchParams.has("groupBy")) {
    const groupByProp = searchParams.get("groupBy");

    const groupByLabel = schema[groupByProp].label;

    return groupByLabel;
  }

  let groupByProp;

  const car = data[0] ?? {};

  // fallback to first date param present in data
  groupByProp = Object.keys(schema).find((prop: any) => {
    const propLabel = schema[prop].label ?? prop;

    return (
      schema[prop].type === "date" &&
      Object.prototype.hasOwnProperty.call(car, propLabel)
    );
  });

  // fallback to first param present in data
  if (!groupByProp) {
    groupByProp = Object.keys(schema).find((prop: any) => {
      const propLabel = schema[prop].label ?? prop;

      return Object.prototype.hasOwnProperty.call(car, propLabel);
    });
  }

  // fallback to first date param present in schema
  if (!groupByProp) {
    groupByProp = Object.keys(schema).find(
      (prop: any) => schema[prop].type === "date"
    );
  }

  // fallback to first param present in schema
  if (!groupByProp) {
    groupByProp = Object.keys(schema)[0];
  }

  // unreachable with a valid scheme
  // fallback to empty string
  if (!groupByProp) {
    groupByProp = "";
  }

  const groupByLabel = schema[groupByProp].label;

  return groupByLabel;
}
