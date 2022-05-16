import * as csvs from '@fetsorn/csvs-js'

const fetchDataMetadir = (path) => new Promise((res, rej) => {
  // console.log("csvs invokes callback")

  const channel = new MessageChannel();

  channel.port1.onmessage = ({data}) => {
    channel.port1.close();
    if (data.error) {
      // console.log("query worker receives error", data.error)
      rej(data.error);
    } else {
      // console.log("query worker receives fetch", data.result)
      res(data.result);
    }
  };

  // console.log("query worker asks main thread to fetch")
  postMessage({action: "fetch", path}, [channel.port2]);
});

async function queryMetadir(message) {
  try {
    console.log("query worker tries to query metadir", message.data.search)
    var result
    try {
      // console.log("query worker calls to csvs")
      let searchParams = new URLSearchParams(message.data.search)
      result = await (await csvs).queryMetadir(searchParams,
                                               {fetch: fetchDataMetadir},
                                               true)
      // console.log("csvs completes")
    } catch(e) {
      console.log("csvs.queryMetadir fails", e)
      result = []
    }
    // console.log("query worker returns query")
    message.ports[0].postMessage({result})
  } catch(e) {
    console.log("query worker errors", e)
    message.ports[0].postMessage({error: e});
  }
}

async function queryOptions(message) {
  try {
    console.log("query worker tries to query options", message.data.param)
    var result
    try {
      // console.log("query worker calls to csvs")
      result = await (await csvs).queryOptions(message.data.param,
                                               {fetch: fetchDataMetadir})
      // console.log("csvs completes")
    } catch(e) {
      console.log("csvs.queryOptions fails", e)
      result = []
    }
    // console.log("query worker returns query")
    message.ports[0].postMessage({result})
  } catch(e) {
    console.log("query worker errors", e)
    message.ports[0].postMessage({error: e});
  }
}

// group events in data by prop_label
function _buildLine(data, prop_label) {

  // { "YYYY-MM-DD": [event1, event2, event3] }
  var object_of_arrays = data.reduce((acc, item) => {
    let prop_value = item[prop_label]
    acc[prop_value] = acc[prop_value] || []
    acc[prop_value].push(item)
    return acc
  }, {})

  // console.log(object_of_arrays)

  // [ {"date": "YYYY-MM-DD","events": [event1, event2, event3]} ]
  var array_of_objects = Object.keys(object_of_arrays).sort()
                               .map((key) => {return {date: key,
                                                      events: object_of_arrays[key]}})

  // console.log(array_of_objects)

  return array_of_objects
}

async function buildLine(message) {
  try {
    console.log("query worker tries to build line", message.data.prop_label)
    var result
    try {
      result = _buildLine(message.data.data, message.data.prop_label)
      // console.log("csvs completes")
    } catch(e) {
      console.log("buildLine fails", e)
      result = []
    }
    // console.log("query worker returns query")
    message.ports[0].postMessage({result})
  } catch(e) {
    console.log("query worker errors", e)
    message.ports[0].postMessage({error: e});
  }
}

onmessage = async (message) => {
  // console.log("query worker received message", message)
  if (message.data.action === "query") {
    await queryMetadir(message)
  } else if (message.data.action === "options") {
    await queryOptions(message)
  } else if (message.data.action === "build") {
    await buildLine(message)
  }
}
