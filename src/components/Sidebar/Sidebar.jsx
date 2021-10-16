import { useEffect, useState } from 'react'
import cn from 'classnames'

import { Title, Paragraph, Button, Link } from '@components'
import { formatDate } from '@utils'

import styles from './Sidebar.module.css'

const Sidebar = ({ event: newEvent, loading, onClose: handleClose }) => {
  const [event, setEvent] = useState(newEvent)

  useEffect(() => {
    if(typeof newEvent !== 'undefined') {
      setEvent(newEvent)
    }
  }, [newEvent])

  useEffect(() => console.log( event ))

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
          {event?.DATUM && (
            <Paragraph>{event?.DATUM}</Paragraph>
          )}
          {event?.PATH && (
            <Paragraph><Link href={event?.PATH} target="_blank" rel="noreferrer">Вложение</Link></Paragraph>
          )}
          {event?.PATH && (
            <Paragraph><iframe src={"api/" + event?.PATH} width="100%" height="800px"></iframe></Paragraph>
          )}
          <Button type="button" onClick={handleClose}>Закрыть</Button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
