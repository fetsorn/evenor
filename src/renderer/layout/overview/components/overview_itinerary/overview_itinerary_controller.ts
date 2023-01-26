export async function buildItinerary(overview: any, groupByLabel: any) {
  const queryWorker = queryWorkerInit();

  const itinerary = await queryWorker.buildLine(overview, groupByLabel);

  return itinerary;
}

export function getGroupByLabel(schema: any, groupBy: any) {
  const groupByLabel = schema[groupBy]["label"] ?? groupBy;

  return groupByLabel;
}

function queryWorkerInit() {
  const worker = new Worker(new URL("./worker", import.meta.url));

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

  return { buildLine };
}

