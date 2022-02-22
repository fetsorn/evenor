import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs';
import git from 'isomorphic-git'

import { grep } from 'fetsorn/wasm-grep'

import { fetchDataMetadir } from '@utils'

const config = {
  "datum": {
    "type": "string"
  },
  "hostdate": {
    "parent": "datum",
    "dir": "date",
    "type": "date",
    "label": "HOST_DATE"
  },
  "hostname": {
    "parent": "datum",
    "dir": "name",
    "label": "HOST_NAME"
  },
  "guestdate": {
    "parent": "datum",
    "dir": "date",
    "type": "date",
    "label": "GUEST_DATE"
  },
  "guestname": {
    "parent": "datum",
    "dir": "name",
    "label": "GUEST_NAME"
  },
  "tag": {
    "parent": "datum",
    "label": "TAG"
  },
  "filepath": {
    "parent": "datum",
    "label": "FILE_PATH",
    "type": "string"
  },
  "moddate": {
    "parent": "filepath",
    "dir": "date",
    "type": "date",
    "label": "GUEST_DATE"
  },
  "filetype": {
    "parent": "filepath",
    "label": "FILE_TYPE",
    "type": "string"
  },
  "filesize": {
    "parent": "filepath",
    "label": "FILE_SIZE"
  },
  "filehash": {
    "parent": "filepath",
    "label": "FILE_HASH",
    "type": "hash"
  },
  "pathrule": {
    "parent": "filepath",
    "type": "regex"
  }
}

function lookup(lines, uuid) {
  let line = lines.find(line => (new RegExp(uuid)).test(line)) ?? ""
  let value = line.slice(65)
  return value
}

export async function queryMetadir(searchParams, fs) {
  let datum_guestname_pair = (await fetchDataMetadir("metadir/pairs/datum-guestname.csv", fs)).split('\n')
  let datum_hostname_pair = (await fetchDataMetadir("metadir/pairs/datum-hostname.csv", fs)).split('\n')
  let datum_guestdate_pair = (await fetchDataMetadir("metadir/pairs/datum-guestdate.csv", fs)).split('\n')
  let datum_hostdate_pair = (await fetchDataMetadir("metadir/pairs/datum-hostdate.csv", fs)).split('\n')
  let filepath_moddate_pair = (await fetchDataMetadir("metadir/pairs/filepath-moddate.csv", fs)).split('\n')
  let datum_filepath_pair_file = await fetchDataMetadir("metadir/pairs/datum-filepath.csv", fs)
  let datum_filepath_pair = datum_filepath_pair_file.split('\n')
  let datum_tag_pair = (await fetchDataMetadir("metadir/pairs/datum-tag.csv", fs)).split('\n')
  let name_index = (await fetchDataMetadir("metadir/props/name/index.csv", fs)).split('\n')
  let date_index = (await fetchDataMetadir("metadir/props/date/index.csv", fs)).split('\n')
  let filepath_index_file = await fetchDataMetadir("metadir/props/filepath/index.csv", fs)
  let filepath_index = filepath_index_file.split('\n')
  let datum_index = (await fetchDataMetadir("metadir/props/datum/index.csv", fs)).split('\n')
  let tag_index = (await fetchDataMetadir("metadir/props/tag/index.csv", fs)).split('\n')

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
    let datum_uuids_both = datum_guestname_pair.filter(line => datum_uuids_hostname.includes(line.slice(0,64))).map(line => line.slice(0,64))
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
  } else if (searchParams.has('rulename')) {
    var rulename = searchParams.get('rulename')
    let rulefile = (await fetchDataMetadir(`metadir/props/pathrule/rules/${rulename}.rule`))
    let filepath_grep = await grep(filepath_index_file, rulefile)
    let filepath_lines = filepath_grep.replace(/\n*$/, "").split("\n").filter(line => line != "")
    let filepath_uuids = filepath_lines.map(line => line.slice(0,64))
    let filepath_uuids_list = filepath_uuids.join("\n") + "\n"
    let datum_grep = await grep(datum_filepath_pair_file, filepath_uuids_list)
    datum_uuids = datum_grep.replace(/\n*$/, "").split("\n").map(line => line.slice(0,64))
  } else {
    // list all datums if no query is provided
    datum_uuids = datum_index.map(line => line.slice(0,64))
  }

  if (searchParams.has('tag')) {
    let tag = searchParams.get('tag')
    let tag_uuid = (tag_index.find(line => (new RegExp("," + tag + "$")).test(line)) ?? falseRegex).slice(0,64)
    let datum_uuids_tag = datum_tag_pair.filter(line => (new RegExp(tag_uuid)).test(line)).map(line => line.slice(0,64))
    datum_uuids = datum_uuids.filter(line => datum_uuids_tag.includes(line))
  }

  var groupBy = searchParams.get('groupBy') ?? "hostdate"

  var cache = []
  // for every datum_uuid build an event
  for(var i=0; i < datum_uuids.length; i++) {

    var datum_uuid = datum_uuids[i]

    var event = {}
    event.UUID = datum_uuid

    var filepath
    let filepath_uuid = lookup(datum_filepath_pair,datum_uuid)
    if (filepath_uuid != "") {
      filepath = lookup(filepath_index,filepath_uuid)
      filepath = JSON.parse(filepath)
    } else {
      filepath = ""
    }
    event.FILE_PATH = filepath

    if (searchParams.has('rulename')) {
      let moddate_uuid = lookup(filepath_moddate_pair,filepath_uuid)
      // if datum doesn't have a date to group by, skip it
      if (moddate_uuid === "") {
        continue
      }
      let moddate = lookup(date_index,moddate_uuid)
      event.GUEST_DATE = moddate
      event.HOST_DATE = moddate
      event.GUEST_NAME = "fetsorn"
      event.HOST_NAME = "fetsorn"
    } else {
      if (hostname) {
        event.HOST_NAME = hostname
      } else {
        hostname_uuid = lookup(datum_hostname_pair,datum_uuid)
        hostname = lookup(name_index,hostname_uuid)
      }

      if (guestname) {
        event.GUEST_NAME = guestname
      } else {
        guestname_uuid = lookup(datum_guestname_pair,datum_uuid)
        guestname = lookup(name_index,guestname_uuid)
      }

      let hostdate_uuid = lookup(datum_hostdate_pair,datum_uuid)
      // if datum doesn't have a date to group by, skip it
      if (hostdate_uuid === "" && groupBy === "hostdate") {
        continue;
      }
      var hostdate = lookup(date_index,hostdate_uuid)
      event.HOST_DATE = hostdate

      let guestdate_uuid = lookup(datum_guestdate_pair,datum_uuid)
      // if datum doesn't have a date to group by, skip it
      if (guestdate_uuid === "" && groupBy === "guestdate") {
        continue;
      }
      var guestdate = lookup(date_index,guestdate_uuid)
      event.GUEST_DATE = guestdate
    }

    var datum = lookup(datum_index,datum_uuid)
    if (datum != "") {
      datum = JSON.parse(datum)
    }
    event.DATUM = datum

    // {"UUID": "", "HOST_DATE": "", "HOST_NAME": "", "DATUM": ""}
    cache.push(event)
  }
  return cache
}

export async function queryMetadirEvea(searchParams) {

  let datum_guestname_pair = (await fetchDataMetadir("metadir/pairs/datum-guestname.csv")).split('\n')
  let datum_hostname_pair = (await fetchDataMetadir("metadir/pairs/datum-hostname.csv")).split('\n')
  let datum_guestdate_pair = (await fetchDataMetadir("metadir/pairs/datum-guestdate.csv")).split('\n')
  let datum_hostdate_pair = (await fetchDataMetadir("metadir/pairs/datum-hostdate.csv")).split('\n')
  let datum_filepath_pair = (await fetchDataMetadir("metadir/pairs/datum-filepath.csv")).split('\n')
  let name_index = (await fetchDataMetadir("metadir/props/name/index.csv")).split('\n')
  let date_index = (await fetchDataMetadir("metadir/props/date/index.csv")).split('\n')
  let filepath_index = (await fetchDataMetadir("metadir/props/filepath/index.csv")).split('\n')
  let datum_index = (await fetchDataMetadir("metadir/props/datum/index.csv")).split('\n')

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

  console.log("datum_uuids:", datum_uuids)

  var groupBy = searchParams.get('groupBy') ?? "hostdate"

  var cache = []
  // for every datum_uuid build an event
  for(var i=0; i < datum_uuids.length; i++) {

    var datum_uuid = datum_uuids[i]
    console.log("datum_uuid:", datum_uuid)

    var event = {}
    event.UUID = datum_uuid

    if (hostname) {
      event.HOST_NAME = hostname
    } else {
      hostname_uuid = datum_hostname_pair.find(line => (new RegExp(datum_uuid)).test(line)).slice(65)
      hostname = name_index.find(line => (new RegExp(hostname_uuid)).test(line)).slice(65)
      event.HOST_NAME = hostname
    }

    if (guestname) {
      event.GUEST_NAME = guestname
    } else {
      guestname_uuid = datum_guestname_pair.find(line => (new RegExp(datum_uuid)).test(line)).slice(65)
      guestname = name_index.find(line => (new RegExp(guestname_uuid)).test(line)).slice(65)
      event.GUEST_NAME = guestname
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

  return cache
}

const SPEC_URL = 'https://git-lfs.github.com/spec/v1';
const LFS_POINTER_PREAMBLE = `version ${SPEC_URL}\n`;
function pointsToLFS(content) {
  return (
    content[0] === 118) // 'v'
    // && content.subarray(0, 100).indexOf(LFS_POINTER_PREAMBLE) === 0);
    // tries to find preamble at the start of the pointer, fails for some reason
}

async function bodyToBuffer(body) {
  const buffers = [];
  let offset = 0;
  let size = 0;
  for await (const chunk of body) {
    buffers.push(chunk);
    size += chunk.byteLength;
  }

  const result = new Uint8Array(size);
  for (const buffer of buffers) {
    result.set(buffer, offset);
    offset += buffer.byteLength;
  }
  return Buffer.from(result.buffer);
}


export async function resolveLFS(path) {

  var path_elements = path.split('/')

  var root = window.dir
  for (var i=0; i < path_elements.length; i++) {
    let path_element = path_elements[i]
    var files = await window.pfs.readdir(root);
    if (files.includes(path_element)) {
      root += '/' + path_element
    } else {
      console.error(`Cannot load file. Ensure there is a file called ${path_element} in ${root}.`);
      return ""
    }
  }
  var restext = new TextDecoder().decode(await window.pfs.readFile(window.dir + "/" + path));
  var lines = restext.split('\n')
  var oid = lines[1].slice(11)
  var size = parseInt(lines[2].slice(5))

  const lfsInfoRequestData = {
    operation: 'download',
    objects: [{oid, size}],
    transfers: ['basic'],
    ref: { name: "refs/heads/main" },
  }

  let url = window.sessionStorage.getItem('url')
  let token = window.sessionStorage.getItem('token')
  var lfsInfoBody
  if (token != "") {
    const { body } = await http.request({
      url: `${url}/info/lfs/objects/batch`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${token}:`).toString('base64')}`,
        'Accept': 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
      },
      body: [Buffer.from(JSON.stringify(lfsInfoRequestData))],
    });
    lfsInfoBody = body
  } else {
    const { body } = await http.request({
      url: `${url}/info/lfs/objects/batch`,
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
      },
      body: [Buffer.from(JSON.stringify(lfsInfoRequestData))],
    });
    lfsInfoBody = body
  }

  var lfsInfoResponseRaw = (await bodyToBuffer(lfsInfoBody)).toString()
  var lfsInfoResponse = JSON.parse(lfsInfoResponseRaw)
  var downloadAction = lfsInfoResponse.objects[0].actions.download
  const lfsObjectDownloadURL = downloadAction.href;
  const lfsObjectDownloadHeaders = downloadAction.header ?? {};

  const { body: lfsObjectBody } = await http.request({
    url: lfsObjectDownloadURL,
    method: 'GET',
    headers: lfsObjectDownloadHeaders,
  });

  var lfsObjectBuffer = await bodyToBuffer(lfsObjectBody)
  const blob = new Blob([lfsObjectBuffer]);

  return URL.createObjectURL(blob)

}

// check if a filepath exists on local,
// try to fetch lfs on remote,
// otherwise return empty string.
// if filepath is "path/to",
// return either "/api/assets/path/to"
// or /api/lfs/path/to" for local,
// "/lfs/blob/uri" for remote,
// or an empty string.
export async function resolveAssetPath(filepath) {

  if (filepath === "") {
    return ""
  }
  const { REACT_APP_BUILD_MODE } = process.env;

  if (REACT_APP_BUILD_MODE === "local") {
    let localpath = "/api/local/" + filepath
    if ((await fetch(localpath)).ok) {
      return localpath
    }
    let lfspath = "/api/lfs/" + filepath
    if ((await fetch(lfspath)).ok) {
      return lfspath
    }
    return ""
  } else {
    let lfspath_local = "lfs/" + filepath
    let lfspath_remote = await resolveLFS(lfspath_local)
    return lfspath_remote
  }
}

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}

function prune(file, regex) {
  return file.split('\n').filter(line => !(new RegExp(regex)).test(line)).join('\n')
}

export async function addEvent(event) {

    // TODO: use files already fetched during buildJSON
    let datum_guestname_pair = await fetchDataMetadir("metadir/pairs/datum-guestname.csv")
    let datum_hostname_pair = await fetchDataMetadir("metadir/pairs/datum-hostname.csv")
    let datum_guestdate_pair = await fetchDataMetadir("metadir/pairs/datum-guestdate.csv")
    let datum_hostdate_pair = await fetchDataMetadir("metadir/pairs/datum-hostdate.csv")
    let datum_filepath_pair = await fetchDataMetadir("metadir/pairs/datum-filepath.csv")
    let name_index = await fetchDataMetadir("metadir/props/name/index.csv")
    let date_index = await fetchDataMetadir("metadir/props/date/index.csv")
    let filepath_index = await fetchDataMetadir("metadir/props/filepath/index.csv")
    let datum_index = await fetchDataMetadir("metadir/props/datum/index.csv")

    let datum_uuid = await digestMessage(crypto.randomUUID())
    let datum_escaped = JSON.stringify(event.DATUM)
    let datum_line = `${datum_uuid},${datum_escaped}\n`

    let filepath = event.FILE_PATH
    let filepath_uuid = await digestMessage(filepath)
    let filepath_escaped = JSON.stringify(filepath)
    let filepath_line = `${filepath_uuid},${filepath_escaped}\n`

    let datum_filepath_line = `${datum_uuid},${filepath_uuid}\n`

    let guestname = event.GUEST_NAME
    let guestname_uuid = await digestMessage(guestname)
    let guestname_line = `${guestname_uuid},${guestname}\n`

    let datum_guestname_line = `${datum_uuid},${guestname_uuid}\n`

    let hostname = event.HOST_NAME
    let hostname_uuid = await digestMessage(hostname)
    let hostname_line = `${hostname_uuid},${hostname}\n`

    let datum_hostname_line = `${datum_uuid},${hostname_uuid}\n`

    let name_lines = [...new Set([guestname_line, hostname_line])].join('')

    let guestdate = event.GUEST_DATE
    let guestdate_uuid = await digestMessage(guestdate)
    let guestdate_line = `${guestdate_uuid},${guestdate}\n`

    let datum_guestdate_line = `${datum_uuid},${guestdate_uuid}\n`

    let hostdate = event.HOST_DATE
    let hostdate_uuid = await digestMessage(hostdate)
    let hostdate_line = `${hostdate_uuid},${hostdate}\n`

    let datum_hostdate_line = `${datum_uuid},${hostdate_uuid}\n`

    let date_lines = [...new Set([guestdate_line, hostdate_line])].join('')

    await window.pfs.writeFile(window.dir + "/metadir/props/datum/index.csv", datum_index + datum_line, 'utf8')

    await window.pfs.writeFile(window.dir + "/metadir/props/filepath/index.csv", filepath_index + filepath_line, 'utf8')
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-filepath.csv", datum_filepath_pair + datum_filepath_line, 'utf8')

    await window.pfs.writeFile(window.dir + "/metadir/props/name/index.csv", name_index + name_lines, 'utf8')
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-guestname.csv", datum_guestname_pair + datum_guestname_line, 'utf8')
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-hostname.csv", datum_hostname_pair + datum_hostname_line, 'utf8')

    await window.pfs.writeFile(window.dir + "/metadir/props/date/index.csv", date_index + date_lines, 'utf8')
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-guestdate.csv", datum_guestdate_pair + datum_guestdate_line, 'utf8')
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-hostdate.csv", datum_hostdate_pair + datum_hostdate_line, 'utf8')

  }

export async function deleteEvent(datum_uuid) {

    // TODO: use files already fetched during buildJSON
    let datum_guestname_pair = await fetchDataMetadir("metadir/pairs/datum-guestname.csv")
    let datum_hostname_pair = await fetchDataMetadir("metadir/pairs/datum-hostname.csv")
    let datum_guestdate_pair = await fetchDataMetadir("metadir/pairs/datum-guestdate.csv")
    let datum_hostdate_pair = await fetchDataMetadir("metadir/pairs/datum-hostdate.csv")
    let datum_filepath_pair = await fetchDataMetadir("metadir/pairs/datum-filepath.csv")
    let name_index = await fetchDataMetadir("metadir/props/name/index.csv")
    let date_index = await fetchDataMetadir("metadir/props/date/index.csv")
    let filepath_index = await fetchDataMetadir("metadir/props/filepath/index.csv")
    let datum_index = await fetchDataMetadir("metadir/props/datum/index.csv")

    await window.pfs.writeFile(window.dir + "/metadir/props/datum/index.csv", prune(datum_index, datum_uuid), 'utf8')
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-filepath.csv", prune(datum_filepath_pair, datum_uuid), 'utf8')
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-guestdate.csv", prune(datum_guestdate_pair, datum_uuid), 'utf8')
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-hostdate.csv", prune(datum_hostdate_pair, datum_uuid), 'utf8')
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-guestname.csv", prune(datum_guestname_pair, datum_uuid), 'utf8')
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-hostname.csv", prune(datum_hostname_pair, datum_uuid), 'utf8')

  }

export async function editEvent(event) {

    // TODO: use files already fetched during buildJSON
    let datum_guestname_pair = await fetchDataMetadir("metadir/pairs/datum-guestname.csv")
    let datum_hostname_pair = await fetchDataMetadir("metadir/pairs/datum-hostname.csv")
    let datum_guestdate_pair = await fetchDataMetadir("metadir/pairs/datum-guestdate.csv")
    let datum_hostdate_pair = await fetchDataMetadir("metadir/pairs/datum-hostdate.csv")
    let datum_filepath_pair = await fetchDataMetadir("metadir/pairs/datum-filepath.csv")
    let name_index = await fetchDataMetadir("metadir/props/name/index.csv")
    let date_index = await fetchDataMetadir("metadir/props/date/index.csv")
    let filepath_index = await fetchDataMetadir("metadir/props/filepath/index.csv")
    let datum_index = await fetchDataMetadir("metadir/props/datum/index.csv")

    // append to datum-index
    let datum_uuid = event.UUID
    let datum_escaped = JSON.stringify(event.DATUM)
    let datum_line = `${datum_uuid},${datum_escaped}\n`
    await window.pfs.writeFile(window.dir + "/metadir/props/datum/index.csv", prune(datum_index, datum_uuid) + datum_line, 'utf8')
    // append to filepath-index
    let filepath = event.FILE_PATH
    let filepath_uuid = await digestMessage(filepath)
    let filepath_escaped = JSON.stringify(filepath)
    let filepath_line = `${filepath_uuid},${filepath_escaped}\n`
    await window.pfs.writeFile(window.dir + "/metadir/props/filepath/index.csv", prune(filepath_index, filepath_uuid) + filepath_line, 'utf8')
    // append to datum-filepath
    let datum_filepath_line = `${datum_uuid},${filepath_uuid}\n`
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-filepath.csv", prune(datum_filepath_pair, datum_uuid) + datum_filepath_line, 'utf8')
    // append to guestdate-index
    let guestdate = event.GUEST_DATE
    let guestdate_uuid = await digestMessage(guestdate)
    let guestdate_line = `${guestdate_uuid},${guestdate}\n`
    await window.pfs.writeFile(window.dir + "/metadir/props/date/index.csv", prune(date_index, guestdate_uuid) + guestdate_line, 'utf8')
    // append to datum-guestdate
    let datum_guestdate_line = `${datum_uuid},${guestdate_uuid}\n`
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-guestdate.csv", prune(datum_guestdate_pair, datum_uuid) + datum_guestdate_line, 'utf8')
    // append to hostdate-index
    let hostdate = event.HOST_DATE
    let hostdate_uuid = await digestMessage(hostdate)
    let hostdate_line = `${hostdate_uuid},${hostdate}\n`
    await window.pfs.writeFile(window.dir + "/metadir/props/date/index.csv", prune(date_index, hostdate_uuid) + hostdate_line, 'utf8')
    // append to datum-hostdate
    let datum_hostdate_line = `${datum_uuid},${hostdate_uuid}\n`
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-hostdate.csv", prune(datum_hostdate_pair, datum_uuid) + datum_hostdate_line, 'utf8')
    // append to name-index
    let guestname = event.GUEST_NAME
    let guestname_uuid = await digestMessage(guestname)
    let guestname_line = `${guestname_uuid},${guestname}\n`
    await window.pfs.writeFile(window.dir + "/metadir/props/name/index.csv", prune(name_index, guestname_uuid) + guestname_line, 'utf8')
    // append to datum-guestname
    let datum_guestname_line = `${datum_uuid},${guestname_uuid}\n`
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-guestname.csv", prune(datum_guestname_pair, datum_uuid) + datum_guestname_line, 'utf8')
    // append to name-index
    let hostname = event.HOST_NAME
    let hostname_uuid = await digestMessage(hostname)
    let hostname_line = `${hostname_uuid},${hostname}\n`
    await window.pfs.writeFile(window.dir + "/metadir/props/name/index.csv", prune(name_index, hostname_uuid) + hostname_line, 'utf8')
    // append to datum-hostname
    let datum_hostname_line = `${datum_uuid},${hostname_uuid}\n`
    await window.pfs.writeFile(window.dir + "/metadir/pairs/datum-hostname.csv", prune(datum_hostname_pair, datum_uuid) + datum_hostname_line, 'utf8')

  }

export async function commit() {
    await git.add({fs: window.fs, dir: window.dir, filepath: "metadir/pairs/datum-guestname.csv"})
    await git.add({fs: window.fs, dir: window.dir, filepath: "metadir/pairs/datum-hostname.csv"})
    await git.add({fs: window.fs, dir: window.dir, filepath: "metadir/pairs/datum-guestdate.csv"})
    await git.add({fs: window.fs, dir: window.dir, filepath: "metadir/pairs/datum-hostdate.csv"})
    await git.add({fs: window.fs, dir: window.dir, filepath: "metadir/pairs/datum-filepath.csv"})
    await git.add({fs: window.fs, dir: window.dir, filepath: "metadir/props/name/index.csv"})
    await git.add({fs: window.fs, dir: window.dir, filepath: "metadir/props/date/index.csv"})
    await git.add({fs: window.fs, dir: window.dir, filepath: "metadir/props/filepath/index.csv"})
    await git.add({fs: window.fs, dir: window.dir, filepath: "metadir/props/datum/index.csv"})
    let sha = await git.commit({
      fs: window.fs,
      dir: window.dir,
      message: 'antea edit',
      author: {
        name: 'name',
        email: 'name@mail.com'
      }
    })
    let token = window.sessionStorage.getItem('token')
    let ref = window.sessionStorage.getItem('ref')
    let pushResult = await git.push({
      fs: window.fs,
      http,
      dir: window.dir,
      remote: 'origin',
      ref,
      onAuth: () => ({
        username: token
      })
    })
    console.log(pushResult)
  }

export function sum(a, b) {
  return a + b;
}
