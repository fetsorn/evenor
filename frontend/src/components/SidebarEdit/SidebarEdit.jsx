import React, { useEffect, useState } from 'react'
import cn from 'classnames'

import { Title, Paragraph, Button, Link } from '@components'
import { formatDate } from '@utils'
import { editEvent, deleteEvent } from '@fetsorn/csvs-js/src/tbn'

import styles from './SidebarEdit.module.css'

// function generateForm(schema) {

//   let config_props = Object.keys(config)
//   let root = config_props.find(prop => !config[prop].hasOwnProperty("parent"))
//   for (var i in config_props) {
//     let prop = config_props[i]
//   }
// }

const SidebarEdit = ({ event: newEvent, loading, onClose: handleClose, handlePlain, datum, convertSrc, setConvertSrc, eventIndex, err, setErr, lfsSrc, setLFSSrc, setData, buildJSON, schema }) => {
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
          {/* {event?.UUID && ( */}
          {/*   <Button type="button" onClick={async () => { */}
          {/*     await editEvent(event, window.fs.promises, window.dir) */}
          {/*     setData(await buildJSON()) */}
          {/*   }}>Edit</Button> */}
          {/* )} */}
          {event?.UUID && (
            <Button type="button" onClick={async () => {
              await deleteEvent(event.UUID, window.fs.promises, window.dir)
              setData(await buildJSON())
              handleClose()
            }}>Delete</Button>
          )}
          <Button type="button" onClick={handleClose}>X</Button>
          <form>
            {event && Object.keys(schema).map(key => {
              let label = schema[key]["label"]
              let root = Object.keys(schema).find(prop => !schema[prop].hasOwnProperty("parent"))
              if (key != root) {
                return (
                  <div>
                    <label>{label}
                      <input className={styles.input} type="text"
                             value={event[label]}
                             onChange={async (e) => {
                               console.log(event)
                               let newEvent = {...event}
                               newEvent[label] = e.target.value
                               console.log(newEvent)
                               await editEvent(newEvent, window.fs.promises, window.dir)
                               setEvent(newEvent);
                               setData(await buildJSON())
                             }}
                      />
                    </label>
                    <br/>
                  </div>
                )
              } else {
                return (
                  <div>
                    <label>{label}
                      <textarea className={styles.inputtext} type="text"
                                value={event[label]}
                                /* onChange={(e) => {if (event) {setEvent({...event, {label}: e.target.value})}}} */
                      />
                    </label>
                    <br/>
                  </div>
                )
              }
            }) }
          </form>
        </div>
      </div>
    </div>
  )
}

export default SidebarEdit
