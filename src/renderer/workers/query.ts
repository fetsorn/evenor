import { fetchDataMetadir } from "../utils";

export function queryWorkerInit() {
  const worker = new Worker(new URL("./query.worker", import.meta.url));

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

      worker.postMessage({ action: "options", param }, [channel.port2]);
    });

  const buildLine = (data: any, prop_label: any) =>
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

      worker.postMessage({ action: "build", data, prop_label }, [
        channel.port2,
      ]);
    });

  return { buildLine, queryMetadir, queryOptions };
}
