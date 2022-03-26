import { Button } from '@components'
import styles from './Header.module.css'

import LightningFS from '@isomorphic-git/lightning-fs';

const Header = ({setEvent}) => {

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
    {setEvent && (
      <Button type="button" onClick={() => setEvent({})}>New event</Button>
    )}
    <Button type="button" onClick={logout}>Logout</Button>
  </header>
  )}

export default Header
