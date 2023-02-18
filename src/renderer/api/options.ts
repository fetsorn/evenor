import { fetchDataMetadir } from ".";

export async function queryOptions(dir: string, branch: any) {
  const queryWorker = queryWorkerInit(dir);

  try {
    const options = await queryWorker.queryOptions(branch);

    return options;
  } catch (e) {
    console.log(e);

    return [];
  }
}

function queryWorkerInit(dir: string) {
  const worker = new Worker(new URL("./worker", import.meta.url));

  async function callback(message: any) {
    // console.log("main thread receives message", message)

    if (message.data.action === "readFile") {
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

  const queryOptions = (param: any) =>
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

      const searchParams = new URLSearchParams();

      searchParams.set('|', param);

      worker.postMessage({ action: "select", searchParams: searchParams.toString() }, [channel.port2]);
    });

  return { queryOptions };
}
