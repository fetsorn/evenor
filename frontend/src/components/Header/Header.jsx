import { Button } from '@components'
import styles from './Header.module.css'

import { fetchDataMetadir, writeDataMetadir, clone, commit, push, wipe } from '@utils'

import * as csvs from '@fetsorn/csvs-js'

const Header = ({isEdit, setIsEdit, schema, setEvent, reloadPage}) => {

  const home = () => {
    window.open("/","_self")
  }

  const pull = async () => {

    await wipe()
    let url = window.localStorage.getItem('antea_url')
    let token = ""
    if (process.env.REACT_APP_BUILD_MODE !== "local" &&
        !window.localStorage.getItem('antea_public')) {
      token = window.prompt('key')
    }
    await clone(url, token)

    await reloadPage()
  }

  const commitpush = async () => {
    let token = ""
    if (process.env.REACT_APP_BUILD_MODE !== "local") {
      token = window.prompt('key')
    }
    await commit()
    await push(token)
  }

  const newEvent = async () => {
    let _event = {}

    // fill event with values from search query
    Object.keys(schema).map((prop)=>{
      let label = schema[prop]["label"] ?? prop
      let searchParams = new URLSearchParams(window.location.search)
      let value = searchParams.has(prop) ? searchParams.get(prop) : ""
      _event[label] = value
    })

    let event = await (await csvs).editEvent(_event, {fetch: fetchDataMetadir, write: writeDataMetadir})
    setEvent(event)
  }

  const logout = async () => {

    window.localStorage.removeItem('antea_url')
    window.localStorage.removeItem('antea')
    window.localStorage.removeItem('antea_public')

    await wipe()

    window.open("/","_self")
  }

  return (
    <header className={styles.header}>
      { (window.location.pathname !== "/") && <Button type="button" onClick={home}>Home</Button> }
      <Button type="button" onClick={pull}>Pull</Button>
      { isEdit && (
        <div>
          <Button type="button" onClick={commitpush}>Push</Button>
          <Button type="button" onClick={newEvent}>New event</Button>
        </div>
      )}
      { setIsEdit && (
        <label>edit:
          <input type="checkbox"
                 checked={isEdit}
                 onChange={(e) => setIsEdit(e.target.checked)}
          />
        </label>
      )}
      { (process.env.REACT_APP_BUILD_MODE !== "local") && (
        <Button type="button" style={{marginLeft: "auto"}} onClick={logout}>Logout</Button>
      )}
    </header>
  )}

export default Header
