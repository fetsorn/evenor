import React, { useEffect, useState } from 'react'
import cn from 'classnames'
import { Title, Paragraph, Button, Link } from '@components'
import { formatDate, isIFrameable } from '@utils'
import styles from './Sidebar.module.css'

const Sidebar = (props) => {

  let { event: newEvent,
        onClose: handleClose,
        handlePlain,
        datum,
        eventIndex,
        assetPath } = props

  const [event, setEvent] = useState(newEvent)


  useEffect(() => {
    if(typeof newEvent !== 'undefined') {
      setEvent(newEvent)
    }
  }, [newEvent])

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
          {isIFrameable(event?.FILE_PATH) && (
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
