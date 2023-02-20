import { CSVS } from "@fetsorn/csvs-js";

const readFile = (filepath: any) =>
  new Promise((res: any, rej: any) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = ({ data }) => {
      channel.port1.close();

      if (data.error) {
        rej(data.error);
      } else {
        res(data.result);
      }
    };

    postMessage({ action: "readFile", filepath }, [channel.port2] as any);
  });

const grep = (contentFile: string, patternFile: string, isInverted: boolean) =>
  new Promise((res: any, rej: any) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = ({ data }) => {
      channel.port1.close();

      if (data.error) {
        rej(data.error);
      } else {
        res(data.result);
      }
    };

    postMessage({ action: "grep", contentFile, patternFile, isInverted }, [
      channel.port2,
    ] as any);
  });

async function select(message: any) {
  try {
    let result;

    try {
      const searchParams = new URLSearchParams(message.data.searchParams);

      result = await (new CSVS({ readFile, grep })).select(searchParams);
    } catch (e) {
      result = [];
    }

    message.ports[0].postMessage({ result });
  } catch (e) {

    message.ports[0].postMessage({ error: e });
  }
}

onmessage = async (message: any) => {
  if (message.data.action === "select") {
    await select(message);
  }
};
