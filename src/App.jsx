import { useEffect, useState, useMemo } from 'react'
import { Header, Main, Footer, Timeline, Sidebar, VirtualScroll, Row } from './components'
import { useWindowSize, useMedia } from './hooks'
import { REM_DESKTOP, REM_MOBILE } from './constants'

const rowHeights = {
  mobile: 40,
  desktop: 40,
}

const App = () => {
  const [data, setData] = useState([])
  const [, setDataLoading] = useState(true)
  const [event, setEvent] = useState(undefined)
  const [eventLoading, setEventLoading] = useState(false)

  const { width: viewportWidth } = useWindowSize()
  const isMobile = useMedia('(max-width: 600px)')

  const rowHeight = useMemo(() => (
    isMobile
      ? Math.round(viewportWidth / 100 * REM_MOBILE * rowHeights.mobile)
      : Math.round(viewportWidth / 100 * REM_DESKTOP * rowHeights.desktop)
  ), [viewportWidth, isMobile])

  useEffect(() => {
    fetch('/api/timeline.json')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err))
      .finally(() => setDataLoading(false))
  }, [])

  const handleOpenEvent = (link) => {
    setEventLoading(true)
    fetch(`/api/events/${link}`)
      .then((res) => res.json())
      .then((data) => setEvent(data))
      .catch((err) => console.error(err))
      .finally(() => setEventLoading(false))
  }

  const handleCloseEvent = () => setEvent(undefined)

  return (
    <>
      <Header />
      <Main>
        <Timeline>
          <VirtualScroll data={data} rowComponent={Row} rowHeight={rowHeight} onEventClick={handleOpenEvent}/>
        </Timeline>
        <Sidebar event={event} onClose={handleCloseEvent} loading={eventLoading} />
      </Main>
      <Footer />
    </>
  )
}

export default App
