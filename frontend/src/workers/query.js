import { fetchDataMetadir } from '@utils'

export function queryWorkerInit() {

  var worker = new Worker(new URL("@workers/query.worker", import.meta.url))

  async function fetchDataMetadirCallback(message) {
    // console.log("main thread receives message", message)
    if (message.data.action === "fetch") {
      try {
        console.log("main thread tries to fetch", message.data.path)
        let contents = await fetchDataMetadir(message.data.path)
        // console.log("main thread returns fetch")
        message.ports[0].postMessage({result: contents})
      } catch(e) {
        console.log("main thread errors")
        message.ports[0].postMessage({error: e});
      }
    }
  }
  worker.onmessage = fetchDataMetadirCallback

  const queryMetadir = (searchParams) => new Promise((res, rej) => {

    const channel = new MessageChannel()

    channel.port1.onmessage = ({data}) => {
      channel.port1.close()
      if (data.error) {
        rej(data.error)
      } else {
        res(data.result)
      }
    }

    worker.postMessage({action: "query", search: searchParams.toString()}, [channel.port2])
  })

  const buildLine = (data, prop_label) => new Promise((res, rej) => {

    const channel = new MessageChannel()

    channel.port1.onmessage = ({data}) => {
      channel.port1.close()
      if (data.error) {
        rej(data.error)
      } else {
        res(data.result)
      }
    }

    worker.postMessage({action: "build", data, prop_label}, [channel.port2])
  })

  return { buildLine, queryMetadir }
}
