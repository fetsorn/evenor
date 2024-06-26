import { CSVS } from "@fetsorn/csvs-js";

const readFile = (filepath) =>
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

    postMessage({ action: "readFile", filepath }, [channel.port2]);
  });

async function select(message) {
  try {
    let result;

    try {
      const searchParams = new URLSearchParams(message.data.searchParams);

      result = await new CSVS({ readFile }).select(searchParams);
    } catch (e) {
      result = [];
    }

    message.ports[0].postMessage({ result });
  } catch (e) {
    message.ports[0].postMessage({ error: JSON.stringify(e) });
  }
}

async function selectStream(message) {
  const channel = new MessageChannel();

  try {
    const searchParams = new URLSearchParams(message.data.searchParams);

    const client = new CSVS({ readFile });

    const result = await client.selectBaseKeys(searchParams);

    if (result) {
      const { base, baseKeys } = result;

      // must keep a common client instance here to reuse cache
      for (const baseKey of baseKeys) {
        const record = await client.buildRecord(base, baseKey);

        postMessage({
          action: "write",
          record,
        });
      }
    }

    postMessage({ action: "close" }, [channel.port2]);
  } catch (e) {
    postMessage({ action: "error", error: JSON.stringify(e) }, [channel.port2]);
  }
}

onmessage = async (message) => {
  if (message.data.action === "select") {
    await select(message);
  } else if (message.data.action === "selectStream") {
    await selectStream(message);
  }
};
