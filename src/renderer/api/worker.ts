import { CSVS } from "@fetsorn/csvs-js";

const readFile = (path: any) =>
  new Promise((res: any, rej: any) => {
    // console.log("csvs invokes callback")

    const channel = new MessageChannel();

    channel.port1.onmessage = ({ data }) => {
      channel.port1.close();

      if (data.error) {
        // console.log("query worker receives error", data.error)

        rej(data.error);
      } else {
        // console.log("query worker receives fetch", data.result)

        res(data.result);
      }
    };

    // console.log("query worker asks main thread to fetch")

    postMessage({ action: "readFile", path }, [channel.port2] as any);
  });

const grep = (contentFile: string, patternFile: string, isInverted: boolean) =>
  new Promise((res: any, rej: any) => {
    // console.log("csvs invokes callback")

    const channel = new MessageChannel();

    channel.port1.onmessage = ({ data }) => {
      channel.port1.close();

      if (data.error) {
        // console.log("query worker receives error", data.error)

        rej(data.error);
      } else {
        // console.log("query worker receives fetch", data.result)

        res(data.result);
      }
    };

    // console.log("query worker asks main thread to fetch")

    postMessage({ action: "grep", contentFile, patternFile, isInverted }, [
      channel.port2,
    ] as any);
  });

async function select(message: any) {
  try {
    console.log(
      "query worker tries to query metadir",
      message.data.searchParams
    );

    let result;

    try {
      // console.log("query worker calls to csvs...");

      const searchParams = new URLSearchParams(message.data.searchParams);

      result = await (new CSVS({ readFile, grep })).select(searchParams);

      // console.log("csvs completes")
    } catch (e) {
      console.log("CSVS.select() fails", message.data.searchParams, e);

      result = [];
    }

    // console.log("query worker returns query")

    message.ports[0].postMessage({ result });
  } catch (e) {
    // console.log("query worker errors", e);

    message.ports[0].postMessage({ error: e });
  }
}

onmessage = async (message: any) => {
  // console.log("query worker received message", message)

  if (message.data.action === "select") {
    await select(message);
  }
};
