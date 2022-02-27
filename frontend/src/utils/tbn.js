import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs';
import git from 'isomorphic-git'

import { grep } from 'fetsorn/wasm-grep'

import { fetchDataMetadir, digestMessage, digestRandom } from '@utils'

const config = {
  "datum": {
    "type": "string",
    "label": "DATUM"
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
  let line = lines.find(line => (new RegExp(uuid)).test(line))
  if (line) {
    let value = line.slice(65)
    return value
  } else {
    return undefined
  }
}

export async function queryMetadir(searchParams, fs) {

  let config_props = Object.keys(config)
  let root = config_props.find(prop => !config[prop].hasOwnProperty("parent"))

  var csv = {}
  csv[`${root}_index`] = (await fetchDataMetadir(`metadir/props/${root}/index.csv`, fs)).split('\n')
  for (var i in config_props) {
    let prop = config_props[i]
     if (prop != root) {
       let parent = config[prop]['parent']
       let pair_file = await fetchDataMetadir(`metadir/pairs/${parent}-${prop}.csv`, fs)
       if (pair_file) {
         csv[`${parent}_${prop}_pair_file`] = pair_file
         csv[`${parent}_${prop}_pair`] = csv[`${parent}_${prop}_pair_file`].split('\n')
       }
       let prop_dir = config[prop]['dir'] ?? prop
       let index_file = await fetchDataMetadir(`metadir/props/${prop_dir}/index.csv`, fs)
       if (index_file) {
         csv[`${prop_dir}_index_file`] = index_file
         csv[`${prop_dir}_index`] = csv[`${prop_dir}_index_file`].split('\n')
       }
     }
  }

  var root_uuids

  if (searchParams.has('rulename')) {
    var rulename = searchParams.get('rulename')
    let rulefile = (await fetchDataMetadir(`metadir/props/pathrule/rules/${rulename}.rule`))
    let filepath_grep = await grep(csv['filepath_index_file'], rulefile)
    let filepath_lines = filepath_grep.replace(/\n*$/, "").split("\n").filter(line => line != "")
    let filepath_uuids = filepath_lines.map(line => line.slice(0,64))
    let filepath_uuids_list = filepath_uuids.join("\n") + "\n"
    let datum_grep = await grep(csv['datum_filepath_pair_file'], filepath_uuids_list)
    datum_uuids = datum_grep.replace(/\n*$/, "").split("\n").map(line => line.slice(0,64))
  } else {
    for (var entry of searchParams.entries()) {
      // if query is not found in the metadir
      // fallback to an impossible regexp
      // so that the filter ouputs empty list
      let falseRegex = "\\b\\B"
      let entry_prop = entry[0]
      let entry_value = entry[1]
      let entry_prop_dir = config[entry_prop]['dir']
      let entry_prop_uuid = (csv[`${entry_prop_dir}_index`].find(line => (new RegExp("," + entry_value + "$")).test(line)) ?? falseRegex).slice(0,64)
      if (!root_uuids) {
        let parent = config[entry_prop]['parent']
        root_uuids = csv[`${parent}_${entry_prop}_pair`].filter(line => (new RegExp(entry_prop_uuid)).test(line)).map(line => line.slice(0,64))
      } else {
        root_uuids = csv[`${parent}_${entry_prop}_pair`].filter(line => root_uuids.includes(line.slice(0,64))).map(line => line.slice(0,64))
      }
    }
  }

  var cache = []
  // for every datum_uuid build an event
  for(var i in root_uuids) {

    let root_uuid = root_uuids[i]

    let event = {}

    event.UUID = root_uuid
    let root_value = lookup(csv[`${root}_index`],root_uuid)
    let root_label = config[root]['label']
    if (root_value != "") {
      root_value = JSON.parse(root_value)
      event[root_label] = root_value
    }

    // TODO can this not be hardcoded?
    if (searchParams.has('rulename')) {
      let moddate_uuid = lookup(csv['filepath_moddate_pair'],filepath_uuid)
      // if datum doesn't have a date to group by, skip it
      if (moddate_uuid === "") {
        continue
      }
      let moddate = lookup(csv['date_index'],moddate_uuid)
      event.GUEST_DATE = moddate
      event.HOST_DATE = moddate
      event.GUEST_NAME = "fetsorn"
      event.HOST_NAME = "fetsorn"
    } else {

      let uuids = {}
      uuids[root] = root_uuid

      // if query is not found in the metadir
      // fallback to an impossible regexp
      // so that next search on uuid fails
      let falseRegex = "\\b\\B"
      // TODO add queue to support the second level of props
      for (var i in config_props) {
        let prop = config_props[i]
        if (prop != root) {
          let parent = config[prop]['parent']
          let pair = csv[`${parent}_${prop}_pair`] ?? ['']
          let parent_uuid = uuids[parent]
          let prop_uuid = lookup(pair, parent_uuid) ?? falseRegex
          uuids[prop] = prop_uuid
          let prop_dir = config[prop]['dir'] ?? prop
          let index = csv[`${prop_dir}_index`] ?? []
          let prop_value = lookup(index, prop_uuid)
          // console.log("get", prop, prop_uuid, parent, parent_uuid, prop_value)
          if ( prop_value != undefined ) {
            let prop_type = config[prop]['type']
            if (prop_type == "string") {
              // console.log("try to parse", prop, prop_value)
              prop_value = JSON.parse(prop_value)
            }
            let label = config[prop]['label'] ?? prop
            // console.log("set", prop, prop_uuid, parent, parent_uuid, prop_value)
            event[label] = prop_value
          }
        }
      }
    }

    // console.log(event)
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

export async function resolveLFS(path, fs, dir, url, token) {

  var path_elements = path.split('/')

  var root = dir
  for (var i=0; i < path_elements.length; i++) {
    let path_element = path_elements[i]
    var files = await fs.promises.readdir(root);
    if (files.includes(path_element)) {
      root += '/' + path_element
    } else {
      console.error(`Cannot load file. Ensure there is a file called ${path_element} in ${root}.`);
      return ""
    }
  }
  var restext = new TextDecoder().decode(await fs.promises.readFile(dir + "/" + path));
  var lines = restext.split('\n')
  var oid = lines[1].slice(11)
  var size = parseInt(lines[2].slice(5))

  const lfsInfoRequestData = {
    operation: 'download',
    objects: [{oid, size}],
    transfers: ['basic'],
    ref: { name: "refs/heads/main" },
  }

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
export async function resolveAssetPath(filepath, fs, dir, url, token) {

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
    let lfspath_remote = await resolveLFS(lfspath_local, fs, dir, url, token)
    return lfspath_remote
  }
}

function includes(file, line) {
  return file.includes(line)
}
function prune(file, regex) {
  return file.split('\n').filter(line => !(new RegExp(regex)).test(line)).join('\n')
}

export async function addEvent(event, fs, dir) {

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

    let datum_uuid = await digestRandom()
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

  await fs.promises.writeFile(dir + "metadir/props/datum/index.csv", datum_index + datum_line, 'utf8')

    await fs.promises.writeFile(dir + "metadir/props/filepath/index.csv", filepath_index + filepath_line, 'utf8')
    await fs.promises.writeFile(dir + "metadir/pairs/datum-filepath.csv", datum_filepath_pair + datum_filepath_line, 'utf8')

    await fs.promises.writeFile(dir + "metadir/props/name/index.csv", name_index + name_lines, 'utf8')
    await fs.promises.writeFile(dir + "metadir/pairs/datum-guestname.csv", datum_guestname_pair + datum_guestname_line, 'utf8')
    await fs.promises.writeFile(dir + "metadir/pairs/datum-hostname.csv", datum_hostname_pair + datum_hostname_line, 'utf8')

    await fs.promises.writeFile(dir + "metadir/props/date/index.csv", date_index + date_lines, 'utf8')
    await fs.promises.writeFile(dir + "metadir/pairs/datum-guestdate.csv", datum_guestdate_pair + datum_guestdate_line, 'utf8')
    await fs.promises.writeFile(dir + "metadir/pairs/datum-hostdate.csv", datum_hostdate_pair + datum_hostdate_line, 'utf8')

  }

export async function deleteEvent(datum_uuid, fs, dir) {

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

    await fs.promises.writeFile(dir + "metadir/props/datum/index.csv", prune(datum_index, datum_uuid), 'utf8')
    await fs.promises.writeFile(dir + "metadir/pairs/datum-filepath.csv", prune(datum_filepath_pair, datum_uuid), 'utf8')
    await fs.promises.writeFile(dir + "metadir/pairs/datum-guestdate.csv", prune(datum_guestdate_pair, datum_uuid), 'utf8')
    await fs.promises.writeFile(dir + "metadir/pairs/datum-hostdate.csv", prune(datum_hostdate_pair, datum_uuid), 'utf8')
    await fs.promises.writeFile(dir + "metadir/pairs/datum-guestname.csv", prune(datum_guestname_pair, datum_uuid), 'utf8')
    await fs.promises.writeFile(dir + "metadir/pairs/datum-hostname.csv", prune(datum_hostname_pair, datum_uuid), 'utf8')

  }

export async function editEvent(event, fs, dir) {

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
  let datum_uuid
  if (event.UUID) {
    datum_uuid = event.UUID
  } else {
    datum_uuid = await digestRandom()
  }

  if (event.DATUM) {
    let datum_escaped = JSON.stringify(event.DATUM)
    let datum_line = `${datum_uuid},${datum_escaped}\n`
    if (!includes(datum_index, datum_line)) {
      await fs.promises.writeFile(dir + "metadir/props/datum/index.csv", prune(datum_index, datum_uuid) + datum_line, 'utf8')
    }
  }
  if (event.FILE_PATH) {
    // append to filepath-index
    let filepath = event.FILE_PATH
    let filepath_uuid = await digestMessage(filepath)
    let filepath_escaped = JSON.stringify(filepath)
    let filepath_line = `${filepath_uuid},${filepath_escaped}\n`
    if (!includes(filepath_index, filepath_line)) {
      await fs.promises.writeFile(dir + "metadir/props/filepath/index.csv", prune(filepath_index, filepath_uuid) + filepath_line, 'utf8')
    }
    // append to datum-filepath
    let datum_filepath_line = `${datum_uuid},${filepath_uuid}\n`
    if (!includes(datum_filepath_pair, datum_filepath_line)) {
      await fs.promises.writeFile(dir + "metadir/pairs/datum-filepath.csv", prune(datum_filepath_pair, datum_uuid) + datum_filepath_line, 'utf8')
    }
  }
  if (event.GUEST_DATE) {
    // append to guestdate-index
    let guestdate = event.GUEST_DATE
    let guestdate_uuid = await digestMessage(guestdate)
    let guestdate_line = `${guestdate_uuid},${guestdate}\n`
    if (!includes(date_index, guestdate_line)) {
      await fs.promises.writeFile(dir + "metadir/props/date/index.csv", prune(date_index, guestdate_uuid) + guestdate_line, 'utf8')
    }
    // append to datum-guestdate
    let datum_guestdate_line = `${datum_uuid},${guestdate_uuid}\n`
    if (!includes(datum_guestdate_pair, datum_guestdate_line)) {
      await fs.promises.writeFile(dir + "metadir/pairs/datum-guestdate.csv", prune(datum_guestdate_pair, datum_uuid) + datum_guestdate_line, 'utf8')
    }
  }
  if (event.HOST_DATE) {
    // append to hostdate-index
    let hostdate = event.HOST_DATE
    let hostdate_uuid = await digestMessage(hostdate)
    let hostdate_line = `${hostdate_uuid},${hostdate}\n`
    if (!includes(date_index, hostdate_line)) {
      await fs.promises.writeFile(dir + "metadir/props/date/index.csv", prune(date_index, hostdate_uuid) + hostdate_line, 'utf8')
    }
    // append to datum-hostdate
    let datum_hostdate_line = `${datum_uuid},${hostdate_uuid}\n`
    if (!includes(datum_hostdate_pair, datum_hostdate_line)) {
      await fs.promises.writeFile(dir + "metadir/pairs/datum-hostdate.csv", prune(datum_hostdate_pair, datum_uuid) + datum_hostdate_line, 'utf8')
    }
  }
  if (event.GUEST_NAME) {
    // append to name-index
    let guestname = event.GUEST_NAME
    let guestname_uuid = await digestMessage(guestname)
    // console.log(guestname, guestname_uuid)
    let guestname_line = `${guestname_uuid},${guestname}\n`
    if (!includes(name_index, guestname_line)) {
      await fs.promises.writeFile(dir + "metadir/props/name/index.csv", prune(name_index, guestname_uuid) + guestname_line, 'utf8')
    }
    // append to datum-guestname
    let datum_guestname_line = `${datum_uuid},${guestname_uuid}\n`
    if (!includes(datum_guestname_pair, datum_guestname_line)) {
      await fs.promises.writeFile(dir + "metadir/pairs/datum-guestname.csv", prune(datum_guestname_pair, datum_uuid) + datum_guestname_line, 'utf8')
    }
  }
  if (event.HOST_NAME) {
    // append to name-index
    let hostname = event.HOST_NAME
    let hostname_uuid = await digestMessage(hostname)
    let hostname_line = `${hostname_uuid},${hostname}\n`
    if (!includes(name_index, hostname_line)) {
      await fs.promises.writeFile(dir + "metadir/props/name/index.csv", prune(name_index, hostname_uuid) + hostname_line, 'utf8')
    }
    // append to datum-hostname
    let datum_hostname_line = `${datum_uuid},${hostname_uuid}\n`
    if (!includes(datum_hostname_pair, datum_hostname_line)) {
      await fs.promises.writeFile(dir + "metadir/pairs/datum-hostname.csv", prune(datum_hostname_pair, datum_uuid) + datum_hostname_line, 'utf8')
    }
  }
}

export async function commit(fs, dir, token, ref) {
    await git.add({fs, dir, filepath: "metadir/pairs/datum-guestname.csv"})
    await git.add({fs, dir, filepath: "metadir/pairs/datum-hostname.csv"})
    await git.add({fs, dir, filepath: "metadir/pairs/datum-guestdate.csv"})
    await git.add({fs, dir, filepath: "metadir/pairs/datum-hostdate.csv"})
    await git.add({fs, dir, filepath: "metadir/pairs/datum-filepath.csv"})
    await git.add({fs, dir, filepath: "metadir/props/name/index.csv"})
    await git.add({fs, dir, filepath: "metadir/props/date/index.csv"})
    await git.add({fs, dir, filepath: "metadir/props/filepath/index.csv"})
    await git.add({fs, dir, filepath: "metadir/props/datum/index.csv"})
    let sha = await git.commit({
      fs,
      dir,
      message: 'antea edit',
      author: {
        name: 'name',
        email: 'name@mail.com'
      }
    })
    let pushResult = await git.push({
      fs,
      http,
      dir,
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
