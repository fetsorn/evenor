import { useEffect, useState, useMemo } from 'react'

import { Header, Main, Footer, Timeline, Sidebar, VirtualScroll, Row } from '@components'
import { useWindowSize, useMedia } from '@hooks'
import { REM_DESKTOP, REM_MOBILE } from '@constants'

const rowHeights = {
  mobile: 40,
  desktop: 40,
}

const App = () => {
  const [data, setData] = useState([])
  const [, setDataLoading] = useState(true)
  const [event, setEvent] = useState(undefined)
  const [eventIndex, setEventIndex] = useState(undefined)
  const [eventLoading, setEventLoading] = useState(false)
  const [datum, setDatum] = useState("")
  const [convertSrc, setConvertSrc] = useState(undefined);
  const [err, setErr] = useState("")

  const { width: viewportWidth } = useWindowSize()
  const isMobile = useMedia('(max-width: 600px)')

  const rowHeight = useMemo(() => (
    isMobile
      ? Math.round(viewportWidth / 100 * REM_MOBILE * rowHeights.mobile)
      : Math.round(viewportWidth / 100 * REM_DESKTOP * rowHeights.desktop)
  ), [viewportWidth, isMobile])

  useEffect(() => {
    var hostname = window.location.pathname.replace(/\//g, "")
    fetch(`/api/hosts/index.json`)
      .then((res) => res.text())
      .then((res) => {
        var events = res.split('\n')
        events.pop()
        var cache = []
        for(var i=0; i < events.length; i++) {
          // console.log(events[i])
          cache.push(JSON.parse(events[i]))
        }
        console.log("event_cache", cache)
        var cache_host = cache.filter(event => event.HOST_NAME == hostname)
        console.log("cache_host", hostname, cache_host)
        var object_of_arrays = cache_host.reduce((acc, item) => {
                                       acc[item.HOST_DATE] = acc[item.HOST_DATE] || []
                                       acc[item.HOST_DATE].push(item)
                                       return acc
                                     }, {})
        console.log("object_of_arrays", object_of_arrays)
        var array_of_objects = Object.keys(object_of_arrays)
                                     .map((key) => {return {date: key,
                                                            events: object_of_arrays[key]}})
        console.log("array_of_objects", array_of_objects)
        return array_of_objects
      })
      .then((data) => setData(data))
      .catch((err) => console.error(err))
      .finally(() => setDataLoading(false))
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
      <Header />
      <Main>
        <Timeline>
          <VirtualScroll data={data} rowComponent={Row} rowHeight={rowHeight} onEventClick={handleOpenEvent}/>
        </Timeline>
        <Sidebar event={event} onClose={handleCloseEvent} loading={eventLoading} handlePlain={handlePlain} datum={datum} convertSrc={convertSrc} setConvertSrc={setConvertSrc} eventIndex={eventIndex} err={err} setErr={setErr}/>
      </Main>
      <Footer />
    </>
  )
}

export default App
