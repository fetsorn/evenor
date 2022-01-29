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
      var files = await window.pfs.readdir(window.dir);
      // console.log("read files", files)
      if (files.includes("index.json")) {
        restext = new TextDecoder().decode(await window.pfs.readFile(window.dir + '/index.json'));
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

  var restext = ""

  try {

    const { REACT_APP_BUILD_MODE } = process.env;

    if (REACT_APP_BUILD_MODE === "local") {
      // fetch cache
      var res = await fetch(`/api/` + path)
      restext = await res.text()
    } else {
      // check if path exists in the repo
      var path_elements = path.split('/')
      var root = window.dir
      for (var i=0; i < path_elements.length; i++) {
        let path_element = path_elements[i]
        var files = await window.pfs.readdir(root);
        console.log(files)
        if (files.includes(path_element)) {
          root += '/' + path_element
          // console.log(`${root} has ${path_element}`)
        } else {
          console.error(`Cannot load file. Ensure there is a file called ${path_element} in ${root}.`);
          break
        }
      }
      // console.log(window.dir + '/' + path)
      restext = new TextDecoder().decode(await window.pfs.readFile(window.dir + '/' + path));
    }

  } catch (e) {
    console.error(e)
  }

  return restext

}

// if there are no files in metadir, output []
// if files are empty, output []
// otherwise, filter and group events by group according to url query
async function buildJSON() {

  let datum_guestname_pair = (await fetchDataMetadir("metadir/pairs/datum-guestname.csv")).split('\n')
  let datum_hostname_pair = (await fetchDataMetadir("metadir/pairs/datum-hostname.csv")).split('\n')
  let datum_guestdate_pair = (await fetchDataMetadir("metadir/pairs/datum-guestdate.csv")).split('\n')
  let datum_hostdate_pair = (await fetchDataMetadir("metadir/pairs/datum-hostdate.csv")).split('\n')
  let datum_filepath_pair = (await fetchDataMetadir("metadir/pairs/datum-filepath.csv")).split('\n')
  let name_index = (await fetchDataMetadir("metadir/props/name/index.csv")).split('\n')
  let date_index = (await fetchDataMetadir("metadir/props/date/index.csv")).split('\n')
  let filepath_index = (await fetchDataMetadir("metadir/props/filepath/index.csv")).split('\n')
  let datum_index = (await fetchDataMetadir("metadir/props/datum/index.csv")).split('\n')

  let search = window.location.search
  let searchParams = new URLSearchParams(search);

  var hostname
  var guestname
  var hostname_uuid
  var guestname_uuid
  var datum_uuids

  // if query is not found in the metadir
  // fallback to an impossible regexp
  // so that filters return an empty array
  let falseRegex = "\\b\\B"
  if (searchParams.has('hostname') && searchParams.has('guestname')) {
    hostname = searchParams.get('hostname')
    guestname = searchParams.get('guestname')
    hostname_uuid = (name_index.find(line => (new RegExp("," + hostname + "$")).test(line)) ?? falseRegex).slice(0,64)
    guestname_uuid = (name_index.find(line => (new RegExp("," + guestname + "$")).test(line)) ?? falseRegex).slice(0,64)
    let datum_uuids_hostname = datum_hostname_pair.filter(line => (new RegExp(hostname_uuid)).test(line)).map(line => line.slice(0,64))
    let datum_uuids_both = datum_guestname_pair.filter(line => datum_uuids_hostname.contains(line.slice(0,64))).map(line => line.slice(0,64))
    datum_uuids = datum_uuids_both
  } else if (searchParams.has('hostname')) {
    hostname = searchParams.get('hostname')
    hostname_uuid = (name_index.find(line => (new RegExp("," + hostname + "$")).test(line)) ?? falseRegex).slice(0,64)
    let datum_uuids_hostname = datum_hostname_pair.filter(line => (new RegExp(hostname_uuid)).test(line)).map(line => line.slice(0,64))
    datum_uuids = datum_uuids_hostname
  } else if (searchParams.has('guestname')) {
    guestname = searchParams.get('guestname')
    guestname_uuid = (name_index.find(line => (new RegExp("," + guestname + "$")).test(line)) ?? falseRegex).slice(0,64)
    let datum_uuids_guestname = datum_guestname_pair.filter(line => (new RegExp(guestname_uuid)).test(line)).map(line => line.slice(0,64))
    datum_uuids = datum_uuids_guestname
  } else {
    // list all datums if no query is provided
    datum_uuids = datum_index.map(line => line.slice(0,64))
  }

  var groupBy = searchParams.get('groupBy') ?? "hostdate"

  var cache = []
  // for every datum_uuid build an event
  for(var i=0; i < datum_uuids.length; i++) {

    var datum_uuid = datum_uuids[i]

    var event = {}
    event.UUID = datum_uuid

    if (hostname) {
      event.HOST_NAME = hostname
    } else {
      hostname_uuid = datum_hostname_pair.find(line => (new RegExp(datum_uuid)).test(line)).slice(65)
      hostname = name_index.find(line => (new RegExp(hostname_uuid)).test(line)).slice(65)
    }

    if (guestname) {
      event.GUEST_NAME = guestname
    } else {
      guestname_uuid = datum_guestname_pair.find(line => (new RegExp(datum_uuid)).test(line)).slice(65)
      guestname = name_index.find(line => (new RegExp(guestname_uuid)).test(line)).slice(65)
    }

    let hostdate_uuid = (datum_hostdate_pair.find(line => (new RegExp(datum_uuid)).test(line)) ?? "").slice(65)
    if (hostdate_uuid === "" && groupBy === "hostdate") {
      continue;
    }
    var hostdate = (date_index.find(line => (new RegExp(hostdate_uuid)).test(line)) ?? "").slice(65)
    event.HOST_DATE = hostdate

    let guestdate_uuid = (datum_guestdate_pair.find(line => (new RegExp(datum_uuid)).test(line)) ?? "").slice(65)
    if (guestdate_uuid === "" && groupBy === "guestdate") {
      continue;
    }
    var guestdate = (date_index.find(line => (new RegExp(guestdate_uuid)).test(line)) ?? "").slice(65)
    event.GUEST_DATE = guestdate

    var filepath
    let filepath_uuid = (datum_filepath_pair.find(line => (new RegExp(datum_uuid)).test(line)) ?? "").slice(65)
    if (filepath_uuid != "") {
      filepath = filepath_index.find(line => (new RegExp(filepath_uuid)).test(line)).slice(65)
      filepath = JSON.parse(filepath)
    } else {
      filepath = ""
    }
    event.FILE_PATH = filepath

    var datum = (datum_index.find(line => (new RegExp(datum_uuid)).test(line)) ?? "").slice(65)
    if (datum != "") {
      datum = JSON.parse(datum)
    }
    event.DATUM = datum

    // {"UUID": "", "HOST_DATE": "", "HOST_NAME": "", "DATUM": ""}
    cache.push(event)
  }

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
      const { REACT_APP_RENDER_MODE } = process.env;
      if (REACT_APP_RENDER_MODE === "legacy") {
        setData(transformJSON(await fetchData()))
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
