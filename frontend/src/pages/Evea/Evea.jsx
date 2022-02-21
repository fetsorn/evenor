import { useEffect, useState, useMemo } from 'react'
import { Header, Main, Footer, Timeline, SidebarEvea, VirtualScroll, Row } from '@components'
import { useWindowSize, useMedia } from '@hooks'
import { REM_DESKTOP, REM_MOBILE } from '@constants'
import { queryMetadirEvea } from '@utils'

const rowHeights = {
  mobile: 40,
  desktop: 40,
}

// if there are no files in metadir, output []
// if files are empty, output []
// otherwise, filter and group events by group according to url query
async function buildJSON() {

  let search = window.location.search
  let searchParams = new URLSearchParams(search);

  var groupBy
  if (searchParams.get('groupBy')) {
    groupBy = searchParams.get('groupBy')
  } else {
    groupBy = "hostdate"
    searchParams.set('groupBy', groupBy)
  }

  var cache = await queryMetadirEvea(searchParams)

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

const Evea = () => {
  const [data, setData] = useState([])
  const [, setDataLoading] = useState(true)
  const [event, setEvent] = useState(undefined)
  const [eventIndex, setEventIndex] = useState(undefined)
  const [eventLoading, setEventLoading] = useState(false)
  const [datum, setDatum] = useState("")
  const [convertSrc, setConvertSrc] = useState(undefined);
  const [lfsSrc, setLFSSrc] = useState(undefined);
  const [err, setErr] = useState("")

  const { width: viewportWidth } = useWindowSize()
  const isMobile = useMedia('(max-width: 600px)')

  const rowHeight = useMemo(() => (
    isMobile
      ? Math.round(viewportWidth / 100 * REM_MOBILE * rowHeights.mobile)
      : Math.round(viewportWidth / 100 * REM_DESKTOP * rowHeights.desktop)
  ), [viewportWidth, isMobile])

  useEffect( () => {
    async function setLine() {
      // if cannot edit, redirect to view
      const { REACT_APP_BUILD_MODE, REACT_APP_RENDER_MODE } = process.env;
      let storeToken = window.sessionStorage.getItem('token')
      if (REACT_APP_BUILD_MODE === "local" || REACT_APP_RENDER_MODE === "legacy" || storeToken == null || storeToken === "" ) {
        window.open((window.location.href).replace("edit", ""),"_self")
      } else {
        setData(await buildJSON())
      }
    }
    setLine()
    setDataLoading(false)
  }, [])

  const handleOpenEvent = (event, index) => {
    setEventLoading(true)
    setEvent(event)
    setEventIndex(index)
    setDatum("")
    setErr("")
    setConvertSrc(undefined)
  }

  const handlePlain = (path) => {
    fetch(`/api/${path}`)
      .then((res) => {console.log(path, res); return res.text()})
      .then((d) => {console.log(d); setDatum(d)})
  }

  const handleCloseEvent = () => setEvent(undefined)

  return (
    <>
      <Header setEvent={setEvent}/>
      <Main>
        <Timeline>
          <VirtualScroll data={data} rowComponent={Row} rowHeight={rowHeight} onEventClick={handleOpenEvent}/>
        </Timeline>
        <SidebarEvea event={event} onClose={handleCloseEvent} loading={eventLoading} handlePlain={handlePlain} datum={datum} convertSrc={convertSrc} setConvertSrc={setConvertSrc} eventIndex={eventIndex} err={err} setErr={setErr} lfsSrc={lfsSrc} setLFSSrc={setLFSSrc} setData={setData} buildJSON={buildJSON}/>
      </Main>
      <Footer />
    </>
  )
}

export default Evea
