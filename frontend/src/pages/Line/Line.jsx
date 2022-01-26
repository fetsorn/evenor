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

async function fetchData() {
  try {

    var restext

    const { REACT_APP_BUILD_MODE } = process.env;

    if (REACT_APP_BUILD_MODE === "local") {
      // fetch cache
      var res = await fetch(`/api/hosts/index.json`)
      restext = await res.text()
    } else {
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
      if (files.includes("index.json")) {
        restext = new TextDecoder().decode(await pfs.readFile(dir + '/index.json'));
        // console.log("read files", files)
      } else {
        console.error("Cannot load file. Ensure there is a file called 'index.json' in the root of the repository.");
      }
    }

    return restext

  } catch (e) {
    console.error(e)
  }
}

// transform a list of events
// into a list of lists of events
// grouped by dates
function transformJSON(restext) {

  // parse cache
  var events = restext.split('\n')
  events.pop()
  var cache = []
  for(var i=0; i < events.length; i++) {
    cache.push(JSON.parse(events[i]))
  }

  // parse url query
  let pathname = window.location.pathname
  console.log("pathname", pathname)
  let search = window.location.search
  console.log("search:", search)
  let searchParams = new URLSearchParams(search);

  if (searchParams.has('hostname')) {
    let hostname = searchParams.get('hostname')
    cache = cache.filter(event => event.HOST_NAME === hostname)
  }
  if (searchParams.has('guestname')) {
    let guestname = searchParams.get('guestname')
    cache = cache.filter(event => event.GUEST_NAME === guestname)
  }
  if (searchParams.has('tag')) {
    let tagname = searchParams.get('tag')
    cache = cache.filter(event => event.TAG === tagname)
  }

  // { "YYYY-MM-DD": [event1, event2, event3] }
  var object_of_arrays
  if (searchParams.get('groupBy') === "guestdate") {
    object_of_arrays = cache.reduce((acc, item) => {
      acc[item.GUEST_DATE] = acc[item.GUEST_DATE] || []
      acc[item.GUEST_DATE].push(item)
      return acc
    }, {})
  } else {
    object_of_arrays = cache.reduce((acc, item) => {
      acc[item.HOST_DATE] = acc[item.HOST_DATE] || []
      acc[item.HOST_DATE].push(item)
      return acc
    }, {})
  }
  // console.log(object_of_arrays)

  // [ {"date": "YYYY-MM-DD","events": [event1, event2, event3]} ]
  var array_of_objects = Object.keys(object_of_arrays).sort()
                               .map((key) => {return {date: key,
                                                      events: object_of_arrays[key]}})
  // console.log(array_of_objects)

  return array_of_objects
}

async function fetchDataMetadir(path) {
  try {

    var restext

    const { REACT_APP_BUILD_MODE } = process.env;

    if (REACT_APP_BUILD_MODE === "local") {
      // fetch cache
      var res = await fetch(`/api/` + path)
      restext = await res.text()
    }
  } catch (e) {
    console.error(e)
  }
}


async function buildJSON() {

  // get hostname from query
  let search = window.location.search
  console.log("search:", search)
  let searchParams = new URLSearchParams(search);
  if (searchParams.has('hostname')) {
    let hostname = searchParams.get('hostname')
  }

  var cache = []

  // get hostname_uuid
  // fetch hostname_index
  let hostname_index = await fetchDataMetadir("metadir/props/hostname/index.csv")
  // parse hostname_index
  var hostname_index_lines = hostname_index.split('\n')
  // find line that matches hostname
  let hostname_regex = new RegExp("," + hostname + "$");
  let hostname_line = hostname_index_lines.find(line => line.test(hostname_regex))
  // split line to cut hostname_uuid
  var hostname_uuid = hostname_line.slice(0,64)
  let hostname_uuid_regex = new RegExp(hostname_uuid)

  // get all datums and datum_uuids associated with hostname_uuid
  // fetch pairs/datum-hostname.csv
  let datum_hostname_pair = await fetchDataMetadir("metadir/pairs/datum-hostname.csv")
  // parse pairs/datum-hostname.csv
  var datum_hostname_pair_lines = datum_hostname_pair.split('\n')
  // find lines that match hostname_uuid
  var datum_uuid_lines = datum_hostname_pair_lines.map(line => line.test(hostname_uuid_regex))

  // split lines to cut datum_uuid
  // build array of datum_uuids associated with hostname
  var datum_uuids = datum_uuid_lines.map(line => line.slice(0,64))

  // prepare lookup tables to build events
  // fetch pairs/datum-hostdate.csv
  let datum_hostdate_pair = await fetchDataMetadir("metadir/pairs/datum-hostdate.csv")
  // parse pairs/datum-hostdate.csv
  var datum_hostdate_pair_lines = datum_hostdate_pair.split('\n')

  // fetch date_index
  let date_index = await fetchDataMetadir("metadir/props/date/index.csv")
  // parse date_index
  var date_index_lines = date_index.split('\n')

  // fetch datum_index
  let datum_index = await fetchDataMetadir("metadir/props/datum/index.csv")
  // parse datum_index
  var datum_index_lines = datum_index.split('\n')

  var cache = []
  // for every datum_uuid build an event
  for(var i=0; i < datum_uuids.length; i++) {

    var datum_uuid = datum_uuids[i]
    let datum_uuid_regex = new RegExp(datum_uuid)

    var event = {}
    event.HOST_NAME = hostname
    event.UUID = datum_uuid

    // .HOST_DATE
    // find line that matches datum_uuid in datum-hostdate pair
    let hostdate_uuid_line = datum_hostdate_pair_lines.find(line => line.test(datum_uuid_regex))
    // split line to cut hostdate_uuid
    let hostdate_uuid = hostdate_uuid_line.slice(66)
    let hostdate_uuid_regex = new RegExp(hostdate_uuid)
    // find line that matches hostdate_uuid in date_index
    let hostdate_line = date_index_lines.find(line => line.test(hostdate_regex))
    // split line to cut hostdate
    let hostdate = hostdate_line.slice(66)
    // add hostdate to the element
    event.HOST_DATE = hostdate

    // .DATUM
    // find line that matches datum_uuid in datum_index
    let datum_line = datum_index.find(line => line.test(datum_uuid_regex))
    // split line to cut datum
    let datum = datum_line.slice(66)
    // parse as JSON to unescape
    let datum_json = JSON.parse(datum)
    // add datum to the element
    event.DATUM = datum_json

    // {"UUID": "", "HOST_DATE": "", "HOST_NAME": "", "DATUM": ""}
    cache.push(event)
  }

  // { "YYYY-MM-DD": [event1, event2, event3] }
  var object_of_arrays = cache_host.reduce((acc, item) => {
    acc[item.HOST_DATE] = acc[item.HOST_DATE] || []
    acc[item.HOST_DATE].push(item)
    return acc
  }, {})
  // console.log(object_of_arrays)

  // [ {"date": "YYYY-MM-DD","events": [event1, event2, event3]} ]
  var array_of_objects = Object.keys(object_of_arrays).sort()
                               .map((key) => {return {date: key,
                                                      events: object_of_arrays[key]}})
  // console.log(array_of_objects)

  return array_of_objects
}

const Line = () => {
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
      var restext = await fetchData()
      var array_of_objects = transformJSON(restext)
      setData(array_of_objects)
    }
    // async function setLineMetadir() {
    //   var array_of_objects = buildJSON()
    //   setData(array_of_objects)
    // }
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

export default Line
