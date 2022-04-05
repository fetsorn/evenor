import { useEffect, useState, useMemo } from 'react'
import { Header, Main, Footer, Timeline, Sidebar, SidebarEdit, VirtualScroll, Row } from '@components'
import { useWindowSize, useMedia } from '@hooks'
import { REM_DESKTOP, REM_MOBILE } from '@constants'
import { fetchDataMetadir, resolveAssetPath } from '@utils'
import * as csvs from '@fetsorn/csvs-js'

const rowHeights = {
  mobile: 40,
  desktop: 40,
}

const Line = () => {
  const [data, setData] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [event, setEvent] = useState(undefined)
  const [eventIndex, setEventIndex] = useState(undefined)
  const [eventLoading, setEventLoading] = useState(false)
  const [datum, setDatum] = useState("")
  const [convertSrc, setConvertSrc] = useState(undefined);
  const [assetPath, setAssetPath] = useState("");
  const [lfsSrc, setLFSSrc] = useState(undefined);
  const [err, setErr] = useState("")
  const [isEdit, setIsEdit] = useState(false)
  const [schema, setSchema] = useState([])

  const { width: viewportWidth } = useWindowSize()
  const isMobile = useMedia('(max-width: 600px)')

  const rowHeight = useMemo(() => (
    isMobile
      ? Math.round(viewportWidth / 100 * REM_MOBILE * rowHeights.mobile)
      : Math.round(viewportWidth / 100 * REM_DESKTOP * rowHeights.desktop)
  ), [viewportWidth, isMobile])

  const queryWorker = new Worker(new URL("@workers/query.worker", import.meta.url))
  queryWorker.onmessage = async (message) => {
    console.log("main thread receives message", message)
    if (message.data.action === "fetch") {
      try {
        console.log("main thread tries to fetch")
        let contents = await fetchDataMetadir(message.data.path)
        console.log("main thread returns fetch")
        message.ports[0].postMessage({result: contents})
      } catch(e) {
        console.log("main thread errors")
        message.ports[0].postMessage({error: e});
      }
    }
  }
  const queryMetadir = () => new Promise((res, rej) => {

    const channel = new MessageChannel()

    channel.port1.onmessage = ({data}) => {
      channel.port1.close()
      if (data.error) {
        rej(data.error)
      } else {
        res(data.result)
      }
    }

    let search = window.location.search
    queryWorker.postMessage({action: "query", search}, [channel.port2])
  })

  useEffect( () => {
    async function setLine() {
      console.log("called to worker for query")
      let line = await queryMetadir()
      console.log("received query result", line)
      setData(line)
      setDataLoading(false)
    }
    setLine()
    async function getSchema() {
      let config = JSON.parse(await fetchDataMetadir("metadir.json"))
      setSchema(config)
    }
    getSchema()
  }, [])

  let url = window.sessionStorage.getItem('url')
  let token = window.sessionStorage.getItem('token')
  const handleOpenEvent = async (event, index) => {
    setEventLoading(true)
    setEvent(event)
    setEventIndex(index)
    setAssetPath("")
    const { REACT_APP_BUILD_MODE } = process.env;
    if (REACT_APP_BUILD_MODE === "local") {
      setAssetPath(await resolveAssetPath(event.FILE_PATH))
    } else {
      setAssetPath(await resolveAssetPath(event.FILE_PATH, url, token))
    }
    setDatum("")
    setErr("")
    setConvertSrc(undefined)
  }

  const handlePlain = (path) => {
    fetch(path)
      .then((res) => {
        console.log(path, res)
        return res.text()
      })
      .then((d) => {console.log(d); setDatum(d)})
  }

  const handleCloseEvent = () => setEvent(undefined)

  return (
    <>
      <Header isEdit={isEdit} setIsEdit={setIsEdit} setEvent={setEvent}/>
      <Main>
        { dataLoading && (<p>Loading...</p>) }
        <Timeline>
          <VirtualScroll data={data} rowComponent={Row} rowHeight={rowHeight} onEventClick={handleOpenEvent}/>
        </Timeline>
        {isEdit ? (
          <SidebarEdit
            event={event}
            onClose={handleCloseEvent}
            loading={eventLoading}
            handlePlain={handlePlain}
            datum={datum}
            convertSrc={convertSrc} setConvertSrc={setConvertSrc}
            eventIndex={eventIndex}
            err={err} setErr={setErr}
            lfsSrc={lfsSrc} setLFSSrc={setLFSSrc}
            setData={setData}
            // TODO replace with a call to webworker
            buildJSON={queryMetadir}
            schema={schema}
          />
        ) : (
          <Sidebar
            event={event}
            onClose={handleCloseEvent}
            loading={eventLoading}
            handlePlain={handlePlain}
            datum={datum}
            convertSrc={convertSrc} setConvertSrc={setConvertSrc}
            eventIndex={eventIndex}
            err={err} setErr={setErr}
            lfsSrc={lfsSrc} setLFSSrc={setLFSSrc}
            assetPath={assetPath}
          />
        )}
      </Main>
      <Footer />
    </>
  )
}

export default Line
