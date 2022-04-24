import { useEffect, useState, useMemo } from 'react'
import {
  Header,
  Main,
  Footer,
  Timeline,
  VirtualScroll
} from '@components'
import {
  Sidebar,
  SidebarEdit,
  Row
} from './components'
import { useWindowSize, useMedia } from '@hooks'
import { REM_DESKTOP, REM_MOBILE } from '@constants'
import { fetchDataMetadir } from '@utils'
import { queryWorkerInit } from '@workers'

const rowHeights = {
  mobile: 40,
  desktop: 40,
}

// search schema for first date prop that appears in data,
// fallback to first prop in schema  that appears in data
function defaultGroupBy(schema, data) {

  let searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has('groupBy')) {
    let groupBy_prop = searchParams.get('groupBy')
    let groupBy_label = schema[groupBy_prop]['label'] ?? groupBy_prop
    return groupBy_label
  }

  let groupBy_prop
  let car = data[0] ?? {}
  groupBy_prop = Object.keys(schema).find(prop => {
    let prop_label = schema[prop]['label'] ?? prop
    return schema[prop]['type'] === "date"
      && car.hasOwnProperty(prop_label)
  })
  if (!groupBy_prop) {
    groupBy_prop = Object.keys(schema).find(prop => {
      let prop_label = schema[prop]['label'] ?? prop
      return car.hasOwnProperty(prop_label)
    })
  }
  if (!groupBy_prop) {
    return ""
  } else {
    let groupBy_label = schema[groupBy_prop]['label'] ?? groupBy_prop
    return groupBy_label
  }
}

const Line = () => {
  const [data, setData] = useState([])
  const [line, setLine] = useState([])
  const [groupBy, setGroupBy] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [event, setEvent] = useState(undefined)
  const [eventIndex, setEventIndex] = useState(undefined)
  const [isEdit, setIsEdit] = useState(false)
  const [schema, setSchema] = useState([])

  const { width: viewportWidth } = useWindowSize()
  const isMobile = useMedia('(max-width: 600px)')

  const rowHeight = useMemo(() => (
    isMobile
      ? Math.round(viewportWidth / 100 * REM_MOBILE * rowHeights.mobile)
      : Math.round(viewportWidth / 100 * REM_DESKTOP * rowHeights.desktop)
  ), [viewportWidth, isMobile])

  const queryWorker = queryWorkerInit()

  const handleOpenEvent = async (event, index) => {
    setEvent(event)
    setEventIndex(index)
  }

  const handleCloseEvent = () => setEvent(undefined)

  const rebuildLine = async (_data = data, _groupBy = groupBy) => {
      let _line = await queryWorker.buildLine(_data, _groupBy)
      // console.log("received build result", _line)
      setLine(_line)
  }

  const reloadPage = async () => {

    setIsLoading(true)

    // console.log("called to worker for query")
    let searchParams = new URLSearchParams(window.location.search)
    let _data = await queryWorker.queryMetadir(searchParams)
    // console.log("received query result", _data)

    let _schema = JSON.parse(await fetchDataMetadir("metadir.json"))

    let _groupBy = defaultGroupBy(_schema, _data)
    // console.log("group by", _groupBy)

    setSchema(_schema)
    setData(_data)
    setGroupBy(_groupBy)

    await rebuildLine(_data, _groupBy)

    setIsLoading(false)
  }

  useEffect( () => {
    reloadPage()
  }, [])

  return (
    <>
      <Header
        isEdit={isEdit} setIsEdit={setIsEdit}
        schema={schema}
        setEvent={setEvent}
        data={data} setData={setData}
        groupBy={groupBy} setGroupBy={setGroupBy} defaultGroupBy={defaultGroupBy}
        reloadPage={reloadPage}
      />
      <Main>
        { isLoading && (
          <p>Loading...</p>
        )}
        <Timeline>
          <VirtualScroll
            data={line}
            rowComponent={Row}
            rowHeight={rowHeight}
            onEventClick={handleOpenEvent}
          />
        </Timeline>
        {isEdit ? (
          <SidebarEdit
            event={event}
            onClose={handleCloseEvent}
            eventIndex={eventIndex}
            data={data} setData={setData}
            rebuildLine={rebuildLine}
            schema={schema}
          />
        ) : (
          <Sidebar
            event={event}
            onClose={handleCloseEvent}
            eventIndex={eventIndex}
          />
        )}
      </Main>
      <Footer />
    </>
  )
}

export default Line
