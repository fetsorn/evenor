import React, { useEffect, useState } from 'react'
import cn from 'classnames'
import * as csvs from '@fetsorn/csvs-js'

import { Title, Paragraph, Button, Link } from '@components'
import { TextInput, TextAreaInput } from './components'
import { formatDate, fetchDataMetadir, writeDataMetadir } from '@utils'
import styles from './SidebarEdit.module.css'

const SidebarEdit = (props) => {

  let { event: newEvent,
        onClose: handleClose,
        eventIndex,
        data, setData,
        rebuildLine,
        schema } = props

  const [event, setEvent] = useState(newEvent)

  useEffect(() => {
    if(typeof newEvent !== 'undefined') {
      setEvent(newEvent)
    }
  }, [newEvent])

  const generateInput = (prop) => {
    let label = schema[prop]["label"]
    let root = Object.keys(schema).find(prop => !schema[prop].hasOwnProperty("parent"))

    async function onChange(e) {
      let _event = {...event}
      _event[label] = e.target.value
      setEvent(_event);
    }

    if (prop != root) {
      return (<TextInput label={label} value={event[label]} onChange={onChange}/>)
    } else {
      return (<TextAreaInput label={label} value={event[label]} onChange={onChange}/>)
    }
  }

  const onSave = async () => {
    await (await csvs).editEvent(event, {fetch: fetchDataMetadir, write: writeDataMetadir})

    let newData = data.map(oldEvent => {
      if (oldEvent.UUID == event.UUID) {
        return event
      } else {
        return oldEvent
      }
    })
    setData(newData)
    await rebuildLine(newData)
  }

  const onDelete = async () => {
    await (await csvs).deleteEvent(event.UUID, {fetch: fetchDataMetadir, write: writeDataMetadir})

    let newData = data.filter(e => e.UUID != event.UUID)
    setData(newData)
    await rebuildLine(newData)

    handleClose()
  }

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
          <div>
            {event && (<Button type="button" onClick={onDelete}>Delete</Button>)}
            {event && (<Button type="button" onClick={onSave}>Save</Button>)}
            <Button type="button" onClick={handleClose}>X</Button>
          </div>
          {event &&
           <form>
             {Object.keys(schema).map(generateInput)}
           </form>
          }
        </div>
      </div>
    </div>
  )
}

export default SidebarEdit
