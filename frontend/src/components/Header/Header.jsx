import { Button } from '@components'
import styles from './Header.module.css'

import LightningFS from '@isomorphic-git/lightning-fs';

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
    {setIsEdit && (
      <label>edit:
        <input type="checkbox" checked={isEdit} onChange={(e) => {console.log(isEdit, e.target.checked); setIsEdit(e.target.checked)}} />
      </label>
    )}
    {isEdit && (
      <Button type="button" onClick={() => setEvent({})}>New event</Button>
    )}
  </header>
  )}

export default Header
