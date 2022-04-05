import * as csvs from '@fetsorn/csvs-js'

const fetchDataMetadir = (path) => new Promise((res, rej) => {
  console.log("csvs invokes callback")

	const channel = new MessageChannel();

	channel.port1.onmessage = ({data}) => {
		channel.port1.close();
		if (data.error) {
      console.log("callback receives error")
			rej(data.error);
		} else {
      console.log("callback receives fetch")
			res(data.result);
		}
	};

  console.log("callback asks main thread to fetch")
  postMessage({action: "fetch", path}, [channel.port2]);
});

// if there are no files in metadir, output []
// if files are empty, output []
// otherwise, filter and group events by group according to url query
async function buildJSON(search) {

  let searchParams = new URLSearchParams(search);

  var groupBy
  if (searchParams.get('groupBy')) {
    groupBy = searchParams.get('groupBy')
  } else {
    groupBy = "hostdate"
    searchParams.set('groupBy', groupBy)
  }

  console.log("worker calls to csvs")
  var cache = await (await csvs).queryMetadir(searchParams, {fetch: fetchDataMetadir}, true)
  console.log("csvs completes")

  // { "YYYY-MM-DD": [event1, event2, event3] }
  var object_of_arrays
  if (groupBy === "hostdate") {
    object_of_arrays = cache.reduce((acc, item) => {
      acc[item.HOST_DATE] = acc[item.HOST_DATE] || []
      acc[item.HOST_DATE].push(item)
      return acc
    }, {})
  } else if (groupBy === "guestdate") {
    object_of_arrays = cache.reduce((acc, item) => {
      acc[item.GUEST_DATE] = acc[item.GUEST_DATE] || []
      acc[item.GUEST_DATE].push(item)
      return acc
    }, {})
  }

  // [ {"date": "YYYY-MM-DD","events": [event1, event2, event3]} ]
  var array_of_objects = Object.keys(object_of_arrays).sort()
                               .map((key) => {return {date: key,
                                                      events: object_of_arrays[key]}})

  return array_of_objects
}

onmessage = async (message) => {
  console.log("worker received message", message)
  if (message.data.action === "query") {
    try {
      console.log("worker tries to query")
      let line = await buildJSON(message.data.search)
      console.log("worker returns query")
      message.ports[0].postMessage({result: line})
    } catch(e) {
      console.log("worker errors")
      message.ports[0].postMessage({error: e});
    }
  }
}
