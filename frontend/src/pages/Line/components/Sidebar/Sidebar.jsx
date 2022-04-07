import React, { useEffect, useState } from 'react'
import cn from 'classnames'
import { Title, Paragraph, Button, Link } from '@components'
import { formatDate, isIFrameable, resolveAssetPath } from '@utils'
import styles from './Sidebar.module.css'

const Sidebar = (props) => {

  let { event: newEvent,
        onClose: handleClose,
        eventIndex } = props

  const [event, setEvent] = useState(newEvent)
  const [assetPath, setAssetPath] = useState(undefined);
  const [datum, setDatum] = useState("")

  const resolvePathLocal = async (e = event) => {
    let filePath = await resolveAssetPath(e.FILE_PATH)
    setAssetPath(filePath)
  }

  const resolvePathLFS = async () => {
    let url = window.localStorage.getItem('antea_url')
    let token = window.prompt('key')
    let blobPath = await resolveAssetPath(event.FILE_PATH, url, token)
    setAssetPath(blobPath)
  }

  const handlePlain = (path) => {
    fetch(path)
      .then((res) => {
        console.log(path, res)
        return res.text()
      })
      .then((d) => {console.log(d); setDatum(d)})
  }

  useEffect(() => {
    // set local copy of event, why? TODO
    if(typeof newEvent !== 'undefined') {
      setEvent(newEvent)
    }

    // reset datum and assetPath on event switch
    setDatum("")
    setAssetPath(undefined)

    // assign assetPath on local
    if (process.env.REACT_APP_BUILD_MODE === "local") {
      resolvePathLocal(newEvent)
    }
  }, [newEvent])

  return (
    <div
      className={cn(
        styles.sidebar,
        { [styles.invisible]: !event },
      )}
    >
      <div className={styles.container}>
        <div className={styles.sticky}>
          <Title>{formatDate(event?.HOST_DATE)} {eventIndex}</Title>
          <Button type="button" onClick={handleClose}>X</Button>
          { (process.env.REACT_APP_BUILD_MODE === "local") && (
            <div>
              <Button type="button" onClick={() => handlePlain(assetPath)}>🖊</Button>
              {assetPath && (
                <Paragraph>
                  <Link href={assetPath} target="_blank" rel="noreferrer">{assetPath}</Link>
                </Paragraph>
              )}
              {/* <Paragraph>{event?.UUID}</Paragraph> */}
            </div>
          )}
          {event?.DATUM && (
            <Paragraph>{event?.DATUM}</Paragraph>
          )}
          <Paragraph>{datum}</Paragraph>
          { (process.env.REACT_APP_BUILD_MODE !== "local") && isIFrameable(event?.FILE_PATH) && (
            <Button type="button" onClick={resolvePathLFS}>Show source</Button>
          )}
          {isIFrameable(event?.FILE_PATH) && assetPath && (
            <Paragraph><iframe title="iframe" src={assetPath} width="100%" height="800px"></iframe></Paragraph>
          )}
          <div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
