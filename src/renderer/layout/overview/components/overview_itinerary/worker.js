function _buildLine(data, branch) {
  // [event1, event, event3]

  // { "YYYY-MM-DD": [event1, event2, event3] }
  const object_of_arrays = data.reduce((acc, entry) => {
    const value = entry[branch];

    acc[value] = acc[value] || [];

    acc[value].push(entry);

    return acc;
  }, {});

  // console.log(object_of_arrays);

  // [ {"date": "YYYY-MM-DD","events": [event1, event2, event3]} ]
  const array_of_objects = Object.keys(object_of_arrays)
    .sort()
    .map((key) => {
      return { date: key, events: object_of_arrays[key] };
    });

  // console.log(array_of_objects);

  return array_of_objects;
}

async function buildLine(message) {
  try {
    // console.log("query worker tries to build line", message.data.branch);

    let result;

    try {
      result = _buildLine(message.data.data, message.data.branch);
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
