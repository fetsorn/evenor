import React, { useEffect, useState } from 'react'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import cn from 'classnames'
import mime from 'mime-types'

import { Title, Paragraph, Button, Link } from '@components'
import { formatDate } from '@utils'

import styles from './Sidebar.module.css'

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

const Sidebar = ({ event: newEvent, loading, onClose: handleClose, handlePlain, datum, convertSrc, setConvertSrc, eventIndex, err, setErr, lfsSrc, setLFSSrc }) => {
  const [event, setEvent] = useState(newEvent)

  useEffect(() => {
    if(typeof newEvent !== 'undefined') {
      setEvent(newEvent)
    }
  }, [newEvent])

  useEffect(() => console.log( event ))

  const ffmpeg = createFFmpeg({
    corePath: 'https:unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
    log: true,
  });

  // breaks in firefox if dev tools are open
  const doTranscode = async (path) => {
    try {
      console.log('Loading ffmpeg-core.js')
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
    console.log("fs initialized")
    var pfs = fs.promises;
    var dir = "/gedcom";
    await pfs.mkdir(dir);
    console.log("dir created")
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
    console.log("cloned")
    var files = await pfs.readdir(dir);
    console.log("read files", files)
    console.log("file path", path)
    var restext
    if (files.includes(path)) {
      restext = new TextDecoder().decode(await pfs.readFile(dir + "/" + path));
      console.log(restext)
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

      // https://cors-anywhere.herokuapp.com/https://source.fetsorn.website/fetsorn/royals.git/info/lfs/objects/batch
      const rawurl = "https://source.fetsorn.website/fetsorn/stars.git"
      const url = "https://cors-anywhere.herokuapp.com/https://source.fetsorn.website/fetsorn/stars.git"
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
          <Button type="button" onClick={() => handlePlain(event?.FILE_PATH)}>🖊</Button>
          <Button type="button" onClick={() => unoconv(event?.FILE_PATH)}>📄</Button>
          <Button type="button" onClick={() => doTranscode(event?.FILE_PATH)}>🔈</Button>
          <Button type="button" onClick={() => handleAsset(event?.FILE_PATH)}>LFS</Button>
          <Button type="button" onClick={handleClose}>X</Button>
          {event?.FILE_PATH && (
            <Paragraph>
              <Link href={"/api/" + event?.FILE_PATH} target="_blank" rel="noreferrer">{event?.FILE_PATH}</Link>
            </Paragraph>
          )}
          <Paragraph>{event?.UUID}</Paragraph>
          {event?.DATUM && (
            <Paragraph>{event?.DATUM}</Paragraph>
          )}
          <Paragraph>{datum}</Paragraph>
          {iframeable.includes(ext) && (
            <Paragraph><iframe title="iframe" src={"/api/" + event?.FILE_PATH} width="100%" height="800px"></iframe></Paragraph>
          )}
          <div>
          {convertSrc && (
            <Paragraph><iframe title="iframe" src={convertSrc} width="100%" height="800px"></iframe></Paragraph>
          )}
          {lfsSrc && (
            <Paragraph><iframe title="iframe" src={lfsSrc} width="100%" height="800px"></iframe></Paragraph>
          )}
          </div>
          <Paragraph>{err}</Paragraph>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
