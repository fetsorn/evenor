function groupArray(data, branch) {
  // [event1, event, event3]

  // { "YYYY-MM-DD": [event1, event2, event3] }
  const objectOfArrays = data.reduce((acc, record) => {
    const value = record[branch] ?? "";

    acc[value] = acc[value] || [];

    acc[value].push(record);

    return acc;
  }, {});

  // console.log(objectOfArrays);

  // [ {"date": "YYYY-MM-DD","events": [event1, event2, event3]} ]
  const arrayOfObjects = Object.keys(objectOfArrays)
    .sort()
    .map((key) => ({ date: key, events: objectOfArrays[key] }));

  // console.log(arrayOfObjects);

  return arrayOfObjects;
}

async function buildLine(message) {
  try {
    // console.log("query worker tries to build line", message.data.branch);

    let result;

    try {
      result = groupArray(message.data.data, message.data.branch);
    } catch (e) {
      console.log("buildLine fails", e);

      result = [];
    }

    // console.log("query worker returns query")

    message.ports[0].postMessage({ result });
  } catch (e) {
    // console.log("query worker errors", e);

    message.ports[0].postMessage({ error: e });
  }
}

onmessage = async (message) => {
  // console.log("query worker received message", message)

  if (message.data.action === "build") {
    await buildLine(message);
  }
};
