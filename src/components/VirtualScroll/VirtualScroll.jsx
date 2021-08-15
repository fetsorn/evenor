import { useState, useEffect, useMemo, useRef } from 'react'
import { useWindowSize } from '../../hooks'

const VirtualScroll = ({ data, rowComponent: Component, rowHeight, tolerance = 2 }) => {
  const topSpacer = useRef()
  const [start, setStart] = useState(0)
  const { height: viewportHeight } = useWindowSize()

  const visibleRowCount = useMemo(() => (
    Math.ceil(viewportHeight / rowHeight) + tolerance * 2
  ), [viewportHeight, rowHeight, tolerance])

  const dataWithKeys = useMemo(() => (
    data.map((elm, index) => ({
      ...elm,
      key: index,
    }))
  ), [data])

  const getTopHeight = () => (rowHeight * start)
  const getBottomHeight = () => (rowHeight * (dataWithKeys.length - (start + visibleRowCount)))

  useEffect(() => {
    const onScroll = () => {
      const offsetTop = topSpacer.current.offsetTop

      const shift = Math.min(
        Math.max(0, Math.floor((window.scrollY - offsetTop) / rowHeight) - tolerance),
        Math.max(0, dataWithKeys.length - visibleRowCount),
      )

      setStart(shift)
    }

    window.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [dataWithKeys, visibleRowCount, rowHeight, tolerance])

  return (
    <>
      <div style={{ height: getTopHeight() }} ref={topSpacer} />
      {dataWithKeys.slice(start, start + visibleRowCount).map((elm, index) => (
        <Component
          data={elm}
          key={elm.key}
          isFirst={elm.key === 0}
          isLast={elm.key === dataWithKeys.length - 1}
          style={{ height: rowHeight }}
        />
      ))}
      <div style={{ height: getBottomHeight() }} />
    </>
  )
}

export default VirtualScroll
