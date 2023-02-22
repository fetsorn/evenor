function queryWorkerInit() {
  const worker = new Worker(new URL('./worker', import.meta.url));

  const buildLine = (data, branch) => new Promise((res, rej) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = ({ dataNew }) => {
      channel.port1.close();

      if (dataNew.error) {
        rej(dataNew.error);
      } else {
        res(dataNew.result);
      }
    };

    worker.postMessage({ action: 'build', data, branch }, [
      channel.port2,
    ]);
  });

  return { buildLine };
}

export async function buildItinerary(overview, groupBy) {
  const queryWorker = queryWorkerInit();

  const itinerary = await queryWorker.buildLine(overview, groupBy);

  return itinerary;
}
