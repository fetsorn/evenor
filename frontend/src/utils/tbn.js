import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs';
import git from 'isomorphic-git'

import { grep } from '@fetsorn/wasm-grep'

import { fetchDataMetadir, digestMessage, digestRandom } from '@utils'

function lookup(lines, uuid) {
  let line = lines.find(line => (new RegExp(uuid)).test(line))
  if (line) {
    let value = line.slice(65)
    return value
  } else {
    return undefined
  }
}

export async function queryMetadir(searchParams, pfs, config_name = "metadir.json") {

  let config = JSON.parse(await fetchDataMetadir(config_name, pfs))

  let config_props = Object.keys(config)
  let root = config_props.find(prop => !config[prop].hasOwnProperty("parent"))

  var csv = {}
  csv[`${root}_index`] = (await fetchDataMetadir(`metadir/props/${root}/index.csv`, pfs)).split('\n')
  for (var i in config_props) {
    let prop = config_props[i]
     if (prop != root) {
       let parent = config[prop]['parent']
       let pair_file = await fetchDataMetadir(`metadir/pairs/${parent}-${prop}.csv`, pfs)
       if (pair_file) {
         csv[`${parent}_${prop}_pair_file`] = pair_file
         csv[`${parent}_${prop}_pair`] = csv[`${parent}_${prop}_pair_file`].split('\n')
       }
       let prop_dir = config[prop]['dir'] ?? prop
       let index_file = await fetchDataMetadir(`metadir/props/${prop_dir}/index.csv`, pfs)
       if (index_file) {
         csv[`${prop_dir}_index_file`] = index_file
         csv[`${prop_dir}_index`] = csv[`${prop_dir}_index_file`].split('\n')
       }
     }
  }

  var root_uuids

  if (searchParams.has('rulename')) {
    var rulename = searchParams.get('rulename')
    let rulefile = await fetchDataMetadir(`metadir/props/pathrule/rules/${rulename}.rule`, pfs)
    let filepath_grep = await grep(csv['filepath_index_file'], rulefile)
    let filepath_lines = filepath_grep.replace(/\n*$/, "").split("\n").filter(line => line != "")
    let filepath_uuids = filepath_lines.map(line => line.slice(0,64))
    let filepath_uuids_list = filepath_uuids.join("\n") + "\n"
    let datum_grep = await grep(csv['datum_filepath_pair_file'], filepath_uuids_list)
    root_uuids = datum_grep.replace(/\n*$/, "").split("\n").map(line => line.slice(0,64))
  } else {
    for (var entry of searchParams.entries()) {
      // if query is not found in the metadir
      // fallback to an impossible regexp
      // so that the filter ouputs empty list
      let falseRegex = "\\b\\B"
      let entry_prop = entry[0]
      if (entry_prop == "groupBy") { continue }
      let entry_value = entry[1]
      let entry_prop_dir = config[entry_prop]['dir']
      let entry_prop_uuid = (csv[`${entry_prop_dir}_index`].find(line => (new RegExp("," + entry_value + "$")).test(line)) ?? falseRegex).slice(0,64)
      let parent = config[entry_prop]['parent']
      if (!root_uuids) {
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
      let filepath_uuid = lookup(csv['datum_filepath_pair'],root_uuid)
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

export async function resolveLFS(path, pfs, dir, url, token) {

  var path_elements = path.split('/')

  var root = dir
  for (var i=0; i < path_elements.length; i++) {
    let path_element = path_elements[i]
    var files = await pfs.readdir(root);
    if (files.includes(path_element)) {
      root += '/' + path_element
    } else {
      console.error(`Cannot load file. Ensure there is a file called ${path_element} in ${root}.`);
      return ""
    }
  }
  var restext = new TextDecoder().decode(await pfs.readFile(dir + "/" + path));
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
export async function resolveAssetPath(filepath, pfs, dir, url, token) {

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
    let lfspath_remote = await resolveLFS(lfspath_local, pfs, dir, url, token)
    return lfspath_remote
  }
}

function includes(file, line) {
  return file.includes(line)
}
function prune(file, regex) {
  return file.split('\n').filter(line => !(new RegExp(regex)).test(line)).join('\n')
}

export async function deleteEvent(root_uuid, pfs, dir, config_name = "metadir.json") {

  let config = JSON.parse(await fetchDataMetadir(config_name, pfs))

  let config_props = Object.keys(config)
  let root = config_props.find(prop => !config[prop].hasOwnProperty("parent"))
  let props = config_props.filter(prop => config[prop].parent == root)

  let index_path = `metadir/props/${root}/index.csv`
  let index_file = await fetchDataMetadir(index_path, pfs)
  if (index_file) {
      await pfs.writeFile(dir + index_path,
                                  prune(index_file, root_uuid),
                                  'utf8')
  }

  for (var i in props) {
    let prop = props[i]
    let pair_path = `metadir/pairs/${root}-${prop}.csv`
    let pair_file = await fetchDataMetadir(pair_path, pfs)
    if (pair_file) {
      await pfs.writeFile(dir + pair_path,
                                  prune(pair_file, root_uuid),
                                  'utf8')
    }
  }
}

export async function editEvent(event, pfs, dir, config_name = "metadir.json") {

  let config = JSON.parse(await fetchDataMetadir(config_name, pfs))

  let config_props = Object.keys(config)
  let root = config_props.find(prop => !config[prop].hasOwnProperty("parent"))

  // list event props that match the config
  let event_keys = Object.keys(event)
  var event_props = []
  for (var i in event_keys) {
    let key = event_keys[i]
    let prop = config_props.find(prop => config[prop].label == key || prop == key)
    if (prop) {
      event_props.push(prop)
    }
  }

  var uuids = {}
  for (var i in event_props) {
    let prop = event_props[i]
    let prop_label = config[prop].label
    let prop_type = config[prop].type
    let prop_value = event[prop] ? event[prop] : event[prop_label]

    let prop_uuid
    if (prop != root) {
      prop_uuid = await digestMessage(prop_value)
    } else {
      if (event.UUID) {
        prop_uuid = event.UUID
      } else {
        prop_uuid = await digestRandom()
      }
    }
    uuids[prop] = prop_uuid

    if (prop_type != "hash") {
      let prop_dir = config[prop]['dir'] ?? prop
      let index_path = `metadir/props/${prop_dir}/index.csv`
      let index_file = await fetchDataMetadir(index_path, pfs)
      if (prop_type == "string") {
        prop_value = JSON.stringify(prop_value)
      }
      let index_line = `${prop_uuid},${prop_value}\n`
      if (!includes(index_file, index_line)) {
        await pfs.writeFile(dir + index_path,
                                    prune(index_file, prop_uuid) + index_line,
                                    'utf8')
      }
    }
    if (prop != root) {
      // append to datum-guestdate
      let parent = config[prop].parent
      let parent_uuid = uuids[parent]
      let pair_path = `metadir/pairs/${parent}-${prop}.csv`
      let pair_file = await fetchDataMetadir(pair_path, pfs)
      let pair_line = `${parent_uuid},${prop_uuid}\n`
      if (!includes(pair_file, pair_line)) {
        await pfs.writeFile(dir + pair_path,
                                    prune(pair_file, parent_uuid) + pair_line,
                                    'utf8')
      }
    }
  }
}

export async function commit(fs, dir, token, ref) {
    await git.add({fs, dir, filepath: "."})
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
