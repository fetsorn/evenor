import { CSVS } from '@fetsorn/csvs-js';

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

  postMessage({ action: 'readFile', filepath }, [channel.port2]);
});

const grep = (contentFile, patternFile, isInverted) => new Promise((res, rej) => {
  const channel = new MessageChannel();

  channel.port1.onmessage = ({ data }) => {
    channel.port1.close();

    if (data.error) {
      rej(data.error);
    } else {
      res(data.result);
    }
  };

  postMessage({
    action: 'grep', contentFile, patternFile, isInverted,
  }, [
    channel.port2,
  ]);
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

onmessage = async (message) => {
  if (message.data.action === 'select') {
    await select(message);
  }
};
