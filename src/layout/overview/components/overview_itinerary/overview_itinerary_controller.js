// function queryWorkerInit() {
//   const worker = new Worker(new URL("./worker", import.meta.url));

//   const buildLine = (data, branch) => new Promise((res, rej) => {
//     const channel = new MessageChannel();

//     channel.port1.onmessage = ({ data: dataNew }) => {
//       channel.port1.close();

//       if (dataNew.error) {
//         rej(dataNew.error);
//       } else {
//         res(dataNew.result);
//       }
//     };

//     worker.postMessage({ action: "build", data, branch }, [
//       channel.port2,
//     ]);
//   });

//   return { buildLine };
// }

function groupArray(data, branch) {
  // [event1, event, event3]

  // { "YYYY-MM-DD": [event1, event2, event3] }
  const objectOfArrays = data.filter(Boolean).reduce((acc, entry) => {
    const value = entry[branch] ?? "";

    acc[value] = acc[value] || [];

    acc[value].push(entry);

    return acc;
  }, {});

  // [ {"date": "YYYY-MM-DD","events": [event1, event2, event3]} ]
  const arrayOfObjects = Object.keys(objectOfArrays)
    .sort()
    .map((key) => ({ date: key, events: objectOfArrays[key] }));

  return arrayOfObjects;
}

export async function buildItinerary(records, sortBy) {
  // disable worker to avoid spawning too much threads on stream updates
  // TODO: replace with worker cancellation strategy
  // const queryWorker = queryWorkerInit();

  // const itinerary = await queryWorker.buildLine(records, sortBy);
  const itinerary = groupArray(records, sortBy);

  return itinerary;
}
