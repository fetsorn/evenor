import { useEffect, useState, useMemo } from 'react'
import { Header, Main, Footer, Button } from '@components'
import { useWindowSize, useMedia } from '@hooks'
import { REM_DESKTOP, REM_MOBILE } from '@constants'
import { wipe, clone } from '@utils'

import styles from './Auth.module.css'

const Auth = ({authorized, setAuthorized}) => {

  const [formUrl, setUrl] = useState("")
  const [formRef, setRef] = useState("main")
  const [formToken, setToken] = useState("")

  // clone git repo and hide authorization
  async function authorize(url, ref, token) {
    try {
      await clone(url, ref, token)

      window.sessionStorage.setItem('url', url)
      window.sessionStorage.setItem('ref', ref)
      window.sessionStorage.setItem('token', token)

      setAuthorized(true)
    } catch (e) {
      // clean up if git initialization failed
      await wipe()
      console.log(e)
    }
  }

  async function login() {

    // read credentials from sessionStorage
    let storeUrl = window.sessionStorage.getItem('url')
    if (storeUrl != null) {
      setUrl(storeUrl)
    }
    let storeRef = window.sessionStorage.getItem('ref')
    if (storeRef != null) {
      setRef(storeRef)
    }
    let storeToken = window.sessionStorage.getItem('token')
    if (storeToken != null) {
      setToken(storeToken)
    }

    console.log("store", storeUrl, storeRef, storeToken)

    // try to login read-write
    if (storeUrl) {
      console.log("try to login read-write")
      await authorize(storeUrl, storeUrl, storeToken)
    }

    // read url and ref from path
    let search = window.location.search
    let searchParams = new URLSearchParams(search);
    let barUrl
    if (searchParams.has('url')) {
      barUrl = searchParams.get('url')
      setUrl(barUrl)
    }
    let barRef = "main"
    if (searchParams.has('ref')) {
      barRef = searchParams.get('ref')
      setRef(barRef)
    }

    // try to login read-only to a public repo from address bar
    if (barUrl) {
      await authorize(barUrl, barRef, "")
      window.history.replaceState(null, null, "/");
    }

  }

  useEffect(() => {

    // ignore git authorization if served from local
    const { REACT_APP_BUILD_MODE } = process.env;
    if (REACT_APP_BUILD_MODE === "local") {
      setAuthorized(true)
    }

    login()

  }, [])

  return (
    <>
      <Main>
        <div>AUTHORIZATION</div>
        <br/>
        <form>
          <label>git repo:
            <input className={styles.input} type="text" value={formUrl} onChange={(e) => setUrl(e.target.value)}/>
          </label>
          <br/>
          <label>branch:
            <input className={styles.input} type="text" value={formRef} onChange={(e) => setRef(e.target.value)}/>
          </label>
          <br/>
          <label>token:
            <input className={styles.input} type="password" value={formToken} onChange={(e) => setToken(e.target.value)}/>
          </label>
        </form>
        <br/>
        <Button type="button" onClick={() => authorize(formUrl, formRef, formToken)}>Login</Button>
      </Main>
      <Footer />
    </>
  )
}

export default Auth
