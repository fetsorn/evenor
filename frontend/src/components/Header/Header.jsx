import { Button } from '@components'
import styles from './Header.module.css'

import { fetchDataMetadir, writeDataMetadir, clone, commit, wipe } from '@utils'

import * as csvs from '@fetsorn/csvs-js'

const Header = ({isEdit, setIsEdit, setEvent, reloadPage}) => {

  const logout = async () => {

    window.localStorage.removeItem('antea_url')
    window.localStorage.removeItem('antea')

    await wipe()

    window.open("/","_self")
  }

  const home = () => {
    window.open("/","_self")
  }

  const save = async () => {
    let token = window.prompt('key')
    await commit(token)
  }

  const newEvent = async () => {
    let event = await (await csvs).editEvent({}, {fetch: fetchDataMetadir, write: writeDataMetadir})
    setEvent(event)
  }

  const pull = async () => {

    await wipe()
    let url = window.localStorage.getItem('antea_url')
    let token = window.prompt('key')
    await clone(url, token)

    await reloadPage()
  }

  return (
  <header className={styles.header}>
    { (window.location.pathname != "/") && <Button type="button" onClick={home}>Home</Button> }
    { (process.env.REACT_APP_BUILD_MODE != "local") && (
      <Button type="button" onClick={pull}>Pull</Button>
    )}
    { (process.env.REACT_APP_BUILD_MODE != "local") && isEdit && (
      <div>
        <Button type="button" onClick={save}>Push</Button>
        <Button type="button" onClick={newEvent}>New event</Button>
      </div>
    )}
    { (process.env.REACT_APP_BUILD_MODE != "local") && setIsEdit && (
      <label>edit:
        <input type="checkbox"
               checked={isEdit}
               onChange={(e) => setIsEdit(e.target.checked)}
        />
      </label>
    )}
    { (process.env.REACT_APP_BUILD_MODE != "local") && (
      <Button type="button" style={{marginLeft: "auto"}} onClick={logout}>Logout</Button>
    )}
  </header>
  )}

export default Header
