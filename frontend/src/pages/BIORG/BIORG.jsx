import { useEffect, useState, useMemo } from 'react'
import { Header, Main, Footer, Timeline, Sidebar, VirtualScroll, Row } from '@components'
import { useWindowSize, useMedia } from '@hooks'
import { REM_DESKTOP, REM_MOBILE } from '@constants'

import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs';
import git from 'isomorphic-git'

const rowHeights = {
  mobile: 40,
  desktop: 40,
}

const BIORG = () => {
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
    async function fetchData() {
    try {

      // fetch cache
      // var res = await fetch(`/api/hosts/index.json`)
      // var restext = await res.text()

      // clone cache
      var fs = new LightningFS('fs', {
        wipe: true
      });
      // console.log("fs initialized")
      var pfs = fs.promises;
      var dir = "/gedcom";
      await pfs.mkdir(dir);
      // console.log("dir created")
      await git.clone({
        fs,
        http,
        dir,
        url: "https://source.fetsorn.website/fetsorn/stars.git",
        corsProxy: "https://cors.isomorphic-git.org",
        ref: "master",
        singleBranch: true,
        depth: 10,
      });
      // console.log("cloned")
      var files = await pfs.readdir(dir);
      // console.log("read files", files)
      var restext
      if (files.includes("index.json")) {
        restext = new TextDecoder().decode(await pfs.readFile(dir + '/index.json'));
        // console.log("read files", files)
      } else {
        console.error("Cannot load file. Ensure there is a file called 'index.json' in the root of the repository.");
      }

      // parse cache
      var events = restext.split('\n')
      events.pop()
      var cache = []
      for(var i=0; i < events.length; i++) {
        cache.push(JSON.parse(events[i]))
      }

      // parse url query
      var pathname = window.location.pathname
      var els = pathname.split('/')
      var hostname = els[1]
      var rulename = els[2]

      // filter cache by query and set timeline data
      var cache_host = hostname ? cache.filter(event => event.HOST_NAME === hostname) : cache
      var cache_rule = rulename ? cache.filter(event => event.RULE === rulename) : cache_host
      var object_of_arrays = cache_rule.reduce((acc, item) => {
        acc[item.HOST_DATE] = acc[item.HOST_DATE] || []
        acc[item.HOST_DATE].push(item)
        return acc
      }, {})
      console.log(object_of_arrays)
      var array_of_objects = Object.keys(object_of_arrays).sort()
                                   .map((key) => {return {date: key,
                                                          events: object_of_arrays[key]}})
      console.log(array_of_objects)
      setData(array_of_objects)
    } catch (e) {
      console.error(e)
    }
    }
    fetchData()
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
        <Sidebar event={event} onClose={handleCloseEvent} loading={eventLoading} handlePlain={handlePlain} datum={datum} convertSrc={convertSrc} setConvertSrc={setConvertSrc} eventIndex={eventIndex} err={err} setErr={setErr} lfsSrc={lfsSrc} setLFSSrc={setLFSSrc}/>
      </Main>
      <Footer />
    </>
  )
}

export default BIORG
