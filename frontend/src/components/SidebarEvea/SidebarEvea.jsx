import React, { useEffect, useState } from 'react'
import cn from 'classnames'

import { Title, Paragraph, Button, Link } from '@components'
import { formatDate } from '@utils'
import { editEvent, deleteEvent, commit } from '@fetsorn/csvs-js/src/tbn'

import styles from './SidebarEvea.module.css'

const SidebarEvea = ({ event: newEvent, loading, onClose: handleClose, handlePlain, datum, convertSrc, setConvertSrc, eventIndex, err, setErr, lfsSrc, setLFSSrc, setData, buildJSON }) => {
  const [event, setEvent] = useState(newEvent)

  useEffect(() => {
    if(typeof newEvent !== 'undefined') {
      setEvent(newEvent)
    }
  }, [newEvent])

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
          {event?.UUID || (
            <Button type="button" onClick={async () => {
              await editEvent(event, window.fs, window.dir)
              setData(await buildJSON())
            }}>Add</Button>
          )}
          {event?.UUID && (
            <Button type="button" onClick={async () => {
              await editEvent(event, window.fs, window.dir)
              setData(await buildJSON())
            }}>Edit</Button>
          )}
          {event?.UUID && (
            <Button type="button" onClick={async () => {
              await deleteEvent(event.UUID, window.fs, window.dir)
              setData(await buildJSON())
              handleClose()
            }}>Delete</Button>
          )}
          <Button type="button" onClick={() => {
            let token = window.sessionStorage.getItem('token')
            let ref = window.sessionStorage.getItem('ref')
            commit(window.fs, window.dir, token, ref)
          }}>Commit</Button>
          <Button type="button" onClick={handleClose}>X</Button>
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
        </div>
      </div>
    </div>
  )
}

export default SidebarEvea
