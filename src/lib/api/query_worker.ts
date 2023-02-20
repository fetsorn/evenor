export default class QueryWorker {
  worker;

  constructor(readFile: (filepath: string) => Promise<string>) {
    const worker = new Worker(new URL("./worker", import.meta.url));

    worker.onmessage = async (message: any) => {
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

      case "grep": {
        try {
          const wasm = await import("@fetsorn/wasm-grep");

          const contents = await wasm.grep(
            message.data.contentFile,
            message.data.patternFile,
            message.data.isInverted ?? false
          );

          message.ports[0].postMessage({ result: contents });
        } catch (e) {
          // safari cannot clone the error object, force to string
          message.ports[0].postMessage({ error: `${e}` });
        }
      }
      }
    }

    this.worker = worker;
  }

  async select(searchParams: URLSearchParams) {
    switch (__BUILD_MODE__) {
    case "server": {
      const response = await fetch("/query?" + searchParams.toString());

      return response.json();
    }
    default: {
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

        this.worker.postMessage(
          { action: "select", searchParams: searchParams.toString() },
          [ channel.port2 ]
        );
      });
    }
    }
  }
}
