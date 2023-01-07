async function fetchDataMetadirBrowser(dir: string, path: string): string {
  // check if path exists in the repo
  const path_elements = [dir].concat(path.split("/"));

  // console.log("fetchDataMetadir: path_elements, path", path_elements, path);

  let root = "";

  const pfs = new LightningFS("fs").promises;

  for (let i = 0; i < path_elements.length; i++) {
    const path_element = path_elements[i];

    root += "/";

    const files = await pfs.readdir(root);

    // console.log("fetchDataMetadir: files", files);

    if (files.includes(path_element)) {
      root += path_element;

      // console.log(`fetchDataMetadir: ${root} has ${path_element}`);
    } else {
      throw Error(
        `Cannot load file. Ensure there is a file called ${path_element} in ${root}.`
      );
    }
  }

  const restext = new TextDecoder().decode(
    await pfs.readFile("/" + dir + "/" + path)
  );

  // console.log(restext)

  return restext;
}

export async function fetchDataMetadir(path: string): string {
  try {
    switch (__BUILD_MODE__) {
      case "server":
        return (await fetch("/api/" + path)).text();

      case "electron":
        return await window.electron.fetchDataMetadir(window.dir, path);

      default:
        return await fetchDataMetadirBrowser(window.dir, path);
    }
  } catch {
    throw Error(`Cannot load file. Ensure there is a file ${path}.`);
  }
}

function queryWorkerInit() {
  const worker = new Worker(new URL("./worker", import.meta.url));

  async function callback(message: any) {
    // console.log("main thread receives message", message)

    if (message.data.action === "fetch") {
      try {
        // console.log("main thread tries to fetch", message.data.path);

        const contents = await fetchDataMetadir(message.data.path);

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

  return { queryMetadir, queryOptions };
}

// pick a param to group data by
export function defaultGroupBy(schema: any, data: any, searchParams: any) {
  // fallback to groupBy param from the search query
  if (searchParams.has("groupBy")) {
    return searchParams.get("groupBy");
  }

  let groupBy_prop;

  const car = data[0] ?? {};

  // fallback to first date param present in data
  groupBy_prop = Object.keys(schema).find((prop: any) => {
    const prop_label = schema[prop]["label"] ?? prop;

    return (
      schema[prop]["type"] === "date" &&
      Object.prototype.hasOwnProperty.call(car, prop_label)
    );
  });

  // fallback to first param present in data
  if (!groupBy_prop) {
    groupBy_prop = Object.keys(schema).find((prop: any) => {
      const prop_label = schema[prop]["label"] ?? prop;

      return Object.prototype.hasOwnProperty.call(car, prop_label);
    });
  }

  // fallback to first date param present in schema
  if (!groupBy_prop) {
    groupBy_prop = Object.keys(schema).find(
      (prop: any) => schema[prop]["type"] === "date"
    );
  }

  // fallback to first param present in schema
  if (!groupBy_prop) {
    groupBy_prop = Object.keys(schema)[0];
  }

  // unreachable with a valid scheme
  // fallback to empty string
  if (!groupBy_prop) {
    groupBy_prop = "";
  }

  return groupBy_prop;
}

export async function fetchSchema() {
  const schema = await fetchDataMetadir("metadir.json");

  return JSON.parse(schema);
}

export function getSearchParams(search: any) {
  const searchParams = new URLSearchParams(search);

  return searchParams;
}

export async function fetchOverview(searchParams: any) {
  const queryWorker = queryWorkerInit();

  const overview = await queryWorker.queryMetadir(searchParams);

  return overview;
}
