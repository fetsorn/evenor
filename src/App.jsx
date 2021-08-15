import { useEffect, useState, useMemo } from 'react'
import { Header, Main, Footer, VirtualScroll, Row } from './components'
import { useWindowSize, useMedia } from './hooks'
import { REM_DESKTOP, REM_MOBILE } from './constants'

const rowHeights = {
  mobile: 32,
  desktop: 32,
}

const App = () => {
  const [, setLoading] = useState(true)
  const [data, setData] = useState([])

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
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => console.log('data', data), [data])
  useEffect(() => console.log('isMobile', isMobile), [isMobile])

  return (
    <>
      <Header />
      <Main>
        <VirtualScroll data={data} rowComponent={Row} rowHeight={rowHeight} />
      </Main>
      <Footer />
    </>
  )
}

export default App
