import { Button } from '@components'
import styles from './Header.module.css'

import LightningFS from '@isomorphic-git/lightning-fs';

import * as csvs from '@fetsorn/csvs-js'

const Header = ({isEdit, setIsEdit, setEvent}) => {

  // remove credentials to sessionStorage, wipe fs and reload
  const logout = async () => {

    window.sessionStorage.removeItem('url')
    window.sessionStorage.removeItem('ref')
    window.sessionStorage.removeItem('token')

    window.fs = new LightningFS('fs', {wipe: true});

    // window.location.reload()
    window.open("/","_self")
  }

  return (
  <header className={styles.header}>
    <h1 className={styles.title}></h1>
    <Button type="button" onClick={logout}>Logout</Button>
    <Button type="button" onClick={async () => {
      let token = window.sessionStorage.getItem('token')
      let ref = window.sessionStorage.getItem('ref')
      await (await csvs).commit(window.fs, window.dir, token, ref)
    }}>Commit</Button>
    {isEdit && (
      <Button type="button" onClick={async () => {
        setEvent(await (await csvs).editEvent({}, window.fs.promises, window.dir))
      }}>New event</Button>
    )}
    {setIsEdit && (
      <label>edit:
        <input type="checkbox" checked={isEdit} onChange={(e) => {console.log(isEdit, e.target.checked); setIsEdit(e.target.checked)}} />
      </label>
    )}
  </header>
  )}

export default Header
