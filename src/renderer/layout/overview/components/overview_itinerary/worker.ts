import * as csvs from "@fetsorn/csvs-js";

function _buildLine(data: any, prop_label: any) {
  // { "YYYY-MM-DD": [event1, event2, event3] }

  const object_of_arrays = data.reduce((acc: any, item: any) => {
    const prop_value = item[prop_label];

    acc[prop_value] = acc[prop_value] || [];

    acc[prop_value].push(item);

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

async function buildLine(message: any) {
  try {
    // console.log("query worker tries to build line", message.data.prop_label);

    let result: any;

    try {
      result = _buildLine(message.data.data, message.data.prop_label);
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

onmessage = async (message: any) => {
  // console.log("query worker received message", message)

  if (message.data.action === "build") {
    await buildLine(message);
  }
};
