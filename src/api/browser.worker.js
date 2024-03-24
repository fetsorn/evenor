import { CSVS } from "@fetsorn/csvs-js";

async function grep(contentFile, patternFile, isInverted = false) {
  const wasm = await import("@fetsorn/wasm-grep");

  return wasm.grep(
    contentFile,
    patternFile,
    isInverted,
  );
}

const readFile = (filepath) => new Promise((res, rej) => {
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

      result = await (new CSVS({ readFile, grep })).select(searchParams);
    } catch (e) {
      result = [];
    }

    message.ports[0].postMessage({ result });
  } catch (e) {
    message.ports[0].postMessage({ error: e });
  }
}

async function selectStream(message) {
  const channel = new MessageChannel();

  try {
    const searchParams = new URLSearchParams(message.data.searchParams);

    const { base, baseKeys } = await (new CSVS({ readFile, grep })).selectBaseKeys(searchParams);

    for (const baseKey of baseKeys) {
      const entry = await (new CSVS({ readFile, grep })).buildRecord(base, baseKey);

      postMessage({
        action: "write",
        entry,
      });
    }

    postMessage({ action: "close" }, [channel.port2]);
  } catch (e) {
    postMessage({ action: "error", error: e }, [channel.port2]);
  }
}

onmessage = async (message) => {
  if (message.data.action === "select") {
    await select(message);
  } else if (message.data.action === "selectStream") {
    await selectStream(message);
  }
};
