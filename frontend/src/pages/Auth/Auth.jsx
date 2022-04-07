import { useEffect, useState, useMemo } from 'react'
import { Header, Main, Footer, Button } from '@components'
import { useWindowSize, useMedia } from '@hooks'
import { REM_DESKTOP, REM_MOBILE } from '@constants'
import { gitInit, wipe, clone } from '@utils'

import styles from './Auth.module.css'

const Auth = ({authorized, setAuthorized}) => {

  const [formUrl, setUrl] = useState("")
  const [formToken, setToken] = useState("")

  // clone git repo and hide authorization
  async function authorize(url, token) {
    try {
      await clone(url, token)

      window.localStorage.setItem('antea_url', url)
      window.localStorage.setItem('antea', true)

      setAuthorized(true)
    } catch (e) {
      // clean up if git initialization failed
      await wipe()
      console.log(e)
    }
  }

  useEffect(() => {

    // ignore git authorization if served from local
    const { REACT_APP_BUILD_MODE } = process.env;
    if (REACT_APP_BUILD_MODE === "local") {
      setAuthorized(true)
    }

    gitInit()

    if (window.localStorage.getItem('antea')) {
      setAuthorized(true)
    }

    // read url from path
    let search = window.location.search
    let searchParams = new URLSearchParams(search);
    let barUrl
    if (searchParams.has('url')) {
      barUrl = searchParams.get('url')
      setUrl(barUrl)
    }

    // try to login read-only to a public repo from address bar
    if (barUrl) {
      authorize(barUrl, "")
      window.history.replaceState(null, null, "/");
    }

  }, [])

  return (
    <>
      <Main>
        <div className={styles.container}>
          <form>
            <div>
              <input
                className={styles.input}
                type="text"
                value={formUrl}
                placeholder="url"
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div>
              <input
                className={styles.input}
                type="password"
                value={formToken}
                placeholder="key"
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
          </form>
          <br/>
          <Button type="button" onClick={() => authorize(formUrl, formToken)}>Login</Button>
        </div>
      </Main>
      <Footer />
    </>
  )
}

export default Auth
