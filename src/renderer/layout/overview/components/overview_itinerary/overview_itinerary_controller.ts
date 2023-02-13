export async function buildItinerary(overview: any, groupBy: any) {
  const queryWorker = queryWorkerInit();

  const itinerary = await queryWorker.buildLine(overview, groupBy);

  return itinerary;
}

function queryWorkerInit() {
  const worker = new Worker(new URL("./worker", import.meta.url));

  const buildLine = (data: any, branch: any) =>
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

      worker.postMessage({ action: "build", data, branch }, [
        channel.port2,
      ]);
    });

  return { buildLine };
}

