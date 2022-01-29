import React, { useEffect, useState } from 'react'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import cn from 'classnames'
import mime from 'mime-types'

import { Title, Paragraph, Button, Link } from '@components'
import { formatDate } from '@utils'

import styles from './SidebarEvea.module.css'

import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs';
import git from 'isomorphic-git'

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

async function fetchDataMetadir(path) {
  try {

    var restext

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
        // console.log(files)
        if (files.includes(path_element)) {
          root += '/' + path_element
          // console.log(`${root} has ${path_element}`)
        } else {
          console.error(`Cannot load file. Ensure there is a file called ${path_element} in ${root}.`);
        }
      }
      // console.log(window.dir + '/' + path)
      restext = new TextDecoder().decode(await window.pfs.readFile(window.dir + '/' + path));
    }

    return restext
  } catch (e) {
    console.error(e)
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

const SidebarEvea = ({ event: newEvent, loading, onClose: handleClose, handlePlain, datum, convertSrc, setConvertSrc, eventIndex, err, setErr, lfsSrc, setLFSSrc, setData, buildJSON }) => {
  const [event, setEvent] = useState(newEvent)

  useEffect(() => {
    if(typeof newEvent !== 'undefined') {
      setEvent(newEvent)
    }
  }, [newEvent])

  // useEffect(() => console.log( event ))

  const ffmpeg = createFFmpeg({
    corePath: 'https:unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
    log: true,
  });

  // breaks in firefox if dev tools are open
  const doTranscode = async (path) => {
    try {
      // console.log('Loading ffmpeg-core.js')
      if (!ffmpeg.isLoaded()) {await ffmpeg.load()}
      console.log('Start transcoding', path)
      var ext = re.exec(path)[1]?.trim()
      var filename = 'test.' + ext
      ffmpeg.FS('writeFile', filename, await fetchFile('/api/' + encodeURIComponent(path)))
      await ffmpeg.run('-i', filename, 'test.mp4')
      console.log('Complete transcoding')
      const data = ffmpeg.FS('readFile', 'test.mp4')
      setConvertSrc(URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' })))
    } catch (e) {
      console.log(e)
      setErr(e.toString())
    }
  };

  const unoconv = async (path) => {
    const resp1 = await fetch('/api/' + path)
    const blob1 = await resp1.blob()
    const mimetype = mime.lookup(path)
    const resp2 = await fetch(`${process.env.REACT_APP_UNOCONV_URL}/convert/format/pdf/output/newname.pdf`,
                              { method: 'POST',
                                body: blob1,
                                headers: {
                                  'Content-Type': mimetype,
                                  'Content-Disposition': 'attachment; filename="example.docx"'
                                },
                              })
    const blob2 = await resp2.blob()
    setConvertSrc(URL.createObjectURL(blob2, { type: 'application/pdf' }))
  };

  const handleAsset = async (path) => {
    if (path.indexOf("lfs/") === 0) {
      await handleLFS
    } else {
      setLFSSrc("http://localhost:3030/" + path)
    }
  }

  const handleLFS = async (path1) => {

    // strip lfs/
    var path = path1.replace("lfs/", "")

    // clone repo, get pointer file
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
    // console.log("file path", path)
    var restext
    if (files.includes(path)) {
      restext = new TextDecoder().decode(await pfs.readFile(dir + "/" + path));
      // console.log(restext)
      var buff = await pfs.readFile(dir + "/" + path);
      //version https://git-lfs.github.com/spec/v1
      //oid sha256:a3a5e715f0cc574a73c3f9bebb6bc24f32ffd5b67b387244c2c909da779a1478
      //size 2
      var info = {oid: "a3a5e715f0cc574a73c3f9bebb6bc24f32ffd5b67b387244c2c909da779a1478", size: 2}
      const lfsInfoRequestData = {
        operation: 'download',
        transfers: ['basic'],
        objects: [info],
      };

      const rawurl = "https://source.fetsorn.website/fetsorn/stars.git"
      const url = "https://cors-anywhere.herokuapp.com" + rawurl
      const { body: lfsInfoBody } = await http.request({
        url: `${url}/info/lfs/objects/batch`,
        method: 'POST',
        headers: {
          // Github LFS doesn’t seem to accept this UA, but works fine without any
          // 'User-Agent': `git/isomorphic-git@${git.version()}`,
          // ...headers,
          // ...authHeaders,
          'Accept': 'application/vnd.git-lfs+json',
          'Content-Type': 'application/vnd.git-lfs+json',
        },
        body: [Buffer.from(JSON.stringify(lfsInfoRequestData))],
      });
      var lfsInfoResponseRaw = (await bodyToBuffer(lfsInfoBody)).toString()
      var lfsInfoResponse = JSON.parse(lfsInfoResponseRaw)
      var downloadAction = lfsInfoResponse.objects[0].actions.download
      const lfsObjectDownloadURL = "https://cors-anywhere.herokuapp.com/" + downloadAction.href;
      const lfsObjectDownloadHeaders = downloadAction.header ?? {};

      const { body: lfsObjectBody } = await http.request({
        url: lfsObjectDownloadURL,
        method: 'GET',
        headers: lfsObjectDownloadHeaders,
      });

      var str = (await bodyToBuffer(lfsObjectBody)).toString()
      const blob = new Blob([str], {type:'plain'});
      console.log(blob)

      setLFSSrc(URL.createObjectURL(blob, { type: 'text' }))

    } else {
      console.error("Cannot load file. Ensure there is a file called 'index.json' in the root of the repository.");
    }

    // const blob = fetchLFS(path)
    // setLFSSrc("https://example.com")
  }

  const addEvent = async (path) => {

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

    setData(await buildJSON())
  }

  const deleteEvent = async (datum_uuid) => {

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

    setData(await buildJSON())
    handleClose()
  }

  const editEvent = async (event) => {

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

    setData(await buildJSON())
  }

  const commit = async () => {
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

  var re =/(?:\.([^.]+))?$/
  var ext = re.exec(event?.FILE_PATH)[1]?.trim()

  const img = ["BMP", "GIF", "ICO", "JPEG", "JPG", "NPO", "PNG", "TIF", "bmp", "eps", "gif", "ico", "jpeg", "jpg", "png", "svg", "tif", "webp", "MPO", "heic", "HEIC"]
  const vid = ["AVI", "BUP", "IFO", "MOV", "MP4", "VOB", "avi", "flv", "m2v", "m4v", "mov", "mp4", "swf", "webm"]
  const src = ["PDF", "Pdf", "acsm", "mobi", "pdf", "pub", "xps"]
  const wav = ["caf", "MOD", "aac", "m3u", "m4a", "mid", "mp3", "ogg", "pk", "flac"]
  const web = ["less", "sass", "scss", "css", "htm", "html", "js", "mht", "url", "xml"]
  const iframeable = img + vid + src + wav + web

  // button to fetch plain text and insert as datum
  return (
    <div
      className={cn(
        styles.sidebar,
        { [styles.invisible]: !newEvent },
      )}
    >
      <div className={styles.container}>
        <div className={styles.sticky}>
          <Title>{formatDate(event?.HOST_DATE)} {eventIndex}</Title>
          {/* <Button type="button" onClick={() => handlePlain(event?.FILE_PATH)}>🖊</Button> */}
          {/* <Button type="button" onClick={() => unoconv(event?.FILE_PATH)}>📄</Button> */}
          {/* <Button type="button" onClick={() => doTranscode(event?.FILE_PATH)}>🔈</Button> */}
          {/* <Button type="button" onClick={() => handleAsset(event?.FILE_PATH)}>LFS</Button> */}
          <Button type="button" onClick={addEvent}>Add</Button>
          <Button type="button" onClick={() => editEvent(event)}>Edit</Button>
          <Button type="button" onClick={() => deleteEvent(event?.UUID)}>Delete</Button>
          <Button type="button" onClick={() => commit()}>Commit</Button>
          <Button type="button" onClick={handleClose}>X</Button>
          {/* {event?.FILE_PATH && ( */}
          {/*   <Paragraph> */}
          {/*     <Link href={"/api/" + event?.FILE_PATH} target="_blank" rel="noreferrer">{event?.FILE_PATH}</Link> */}
          {/*   </Paragraph> */}
          {/* )} */}
          {/* <Paragraph>{event?.UUID}</Paragraph> */}
          <form>
            <label>HOST_NAME:
              <input className={styles.input} type="text" value={event?.HOST_NAME} onChange={(e) => {if (event) {setEvent({...event, HOST_NAME: e.target.value})}}}/>
            </label>
            <br/>
            <label>HOST_DATE:
              <input className={styles.input} type="text" value={event?.HOST_DATE} onChange={(e) => {if (event) {setEvent({...event, HOST_DATE: e.target.value})}}}/>
            </label>
            <br/>
            <label>GUEST_NAME:
              <input className={styles.input} type="text" value={event?.GUEST_NAME} onChange={(e) => {if (event) {setEvent({...event, GUEST_NAME: e.target.value})}}}/>
            </label>
            <br/>
            <label>GUEST_DATE:
              <input className={styles.input} type="text" value={event?.GUEST_DATE} onChange={(e) => {if (event) {setEvent({...event, GUEST_DATE: e.target.value})}}}/>
            </label>
            <br/>
            <label>FILE_PATH:
              <input className={styles.input} type="text" value={event?.FILE_PATH} onChange={(e) => {if (event) {setEvent({...event, FILE_PATH: e.target.value})}}}/>
            </label>
            <br/>
            <label>DATUM:
              <textarea className={styles.inputtext} type="text" value={event?.DATUM} onChange={(e) => {if (event) {setEvent({...event, DATUM: e.target.value})}}}/>
            </label>
          </form>
          {/* {event?.DATUM && ( */}
          {/*   <Paragraph>{event?.DATUM}</Paragraph> */}
          {/* )} */}
          {/* <Paragraph>{datum}</Paragraph> */}
          {/* {iframeable.includes(ext) && ( */}
          {/*   <Paragraph><iframe title="iframe" src={"/api/" + event?.FILE_PATH} width="100%" height="800px"></iframe></Paragraph> */}
          {/* )} */}
          {/* <div> */}
          {/* {convertSrc && ( */}
          {/*   <Paragraph><iframe title="iframe" src={convertSrc} width="100%" height="800px"></iframe></Paragraph> */}
          {/* )} */}
          {/* {lfsSrc && ( */}
          {/*   <Paragraph><iframe title="iframe" src={lfsSrc} width="100%" height="800px"></iframe></Paragraph> */}
          {/* )} */}
          {/* <Paragraph>{err}</Paragraph> */}
        </div>
      </div>
    </div>
  )
}

export default SidebarEvea
