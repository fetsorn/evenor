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

  useEffect(async () => {
    var pathname = window.location.pathname
    var els = pathname.split('/')
    var hostname = els[1]
    var rulename = els[2]

    try {
      var res = await fetch(`/api/hosts/index.json`)
      var restext = await res.text()
      var events = restext.split('\n')
      events.pop()
      var cache = []
      for(var i=0; i < events.length; i++) {
        cache.push(JSON.parse(events[i]))
      }
      var cache_host = hostname ? cache.filter(event => event.HOST_NAME == hostname) : cache
      var cache_rule = rulename ? cache.filter(event => event.RULE == rulename) : cache_host
      var object_of_arrays = cache_rule.reduce((acc, item) => {
        acc[item.HOST_DATE] = acc[item.HOST_DATE] || []
        acc[item.HOST_DATE].push(item)
        return acc
      }, {})
      var array_of_objects = Object.keys(object_of_arrays)
                                   .map((key) => {return {date: key,
                                                          events: object_of_arrays[key]}})
      setData(array_of_objects)
    } catch (e) {
      console.error(e)
    }
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
