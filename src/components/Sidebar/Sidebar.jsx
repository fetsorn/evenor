import React, { useEffect, useState } from 'react'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import cn from 'classnames'
import mime from 'mime-types'

import { Title, Paragraph, Button, Link } from '@components'
import { formatDate } from '@utils'

import styles from './Sidebar.module.css'

const Sidebar = ({ event: newEvent, loading, onClose: handleClose, handlePlain, datum, convertSrc, setConvertSrc }) => {
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
  const doTranscode = async (path) => {
    console.log('Loading ffmpeg-core.js')
    if (!ffmpeg.isLoaded()) {await ffmpeg.load()}
    console.log('Start transcoding', path)
    var ext = re.exec(path)[1]?.trim()
    var filename = 'test.' + ext
    ffmpeg.FS('writeFile', filename, await fetchFile('/api/assets/' + path))
    await ffmpeg.run('-i', filename, 'test.mp4')
    console.log('Complete transcoding')
    const data = ffmpeg.FS('readFile', 'test.mp4')
    setConvertSrc(URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' })))
  };

  const unoconv = async (path) => {
    const resp1 = await fetch('/api/assets/' + path)
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

  var re =/(?:\.([^.]+))?$/
  var ext = re.exec(event?.PATH)[1]?.trim()

  const img = ["BMP", "GIF", "ICO", "JPEG", "JPG", "NPO", "PNG", "TIF", "bmp", "eps", "gif", "ico", "jpeg", "jpg", "png", "svg", "tif", "webp", "MPO", "heic", "HEIC"]
  const vid = ["AVI", "BUP", "IFO", "MOV", "MP4", "VOB", "avi", "flv", "m2v", "m4v", "mov", "mp4", "mpg", "swf", "webm"]
  const src = ["PDF", "Pdf", "acsm", "fb2", "mobi", "pdf", "pub", "xps"]
  const wav = ["caf", "wav", "MOD", "aac", "aif", "amr", "m3u", "m4a", "mid", "mp3", "ogg", "pk", "flac", "aiff"]
  const web = ["less", "sass", "scss", "css", "htm", "html", "js", "mht", "url", "webloc", "xml"]
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
          <Title>{formatDate(event?.HOST_DATE)}</Title>
          <Button type="button" onClick={() => handlePlain(event?.PATH)}>plain</Button>
          <Button type="button" onClick={() => doTranscode(event?.PATH)}>mkv</Button>
          <Button type="button" onClick={() => unoconv(event?.PATH)}>doc</Button>
          <Button type="button" onClick={handleClose}>X</Button>
          {event?.PATH && (
            <Paragraph>
              <Link href={"/api/assets/" + event?.PATH} target="_blank" rel="noreferrer">{event?.PATH}</Link>
            </Paragraph>
          )}
          <Paragraph>{event?.UUID}</Paragraph>
          {event?.DATUM && (
            <Paragraph>{event?.DATUM}</Paragraph>
          )}
          <Paragraph>{datum}</Paragraph>
          {iframeable.includes(ext) && (
            <Paragraph><iframe title="iframe" src={"/api/assets/" + event?.PATH} width="100%" height="800px"></iframe></Paragraph>
          )}
          {convertSrc && (
            <Paragraph><iframe title="iframe" src={convertSrc} width="100%" height="800px"></iframe></Paragraph>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
