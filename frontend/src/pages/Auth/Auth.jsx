import { useEffect, useState, useMemo } from 'react'
import { Header, Main, Footer, Button } from '@components'
import { useWindowSize, useMedia } from '@hooks'
import { REM_DESKTOP, REM_MOBILE } from '@constants'

import styles from './Auth.module.css'

import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs';
import git from 'isomorphic-git'

async function gitInit(url, ref, token) {
  console.log("gitInit", url, ref, token)
  window.fs = new LightningFS('fs');
  window.pfs = window.fs.promises;
  window.dir = "/git/";
  window.url = url;
  console.log(await window.pfs.readdir("/"))
  if ((await window.pfs.readdir("/")).includes("git")) {
    // presume that the repo is fine if /git exists
    console.log("repo exists")
  } else {
    await window.pfs.mkdir(window.dir);
    // attempt to clone a public repo if no token is provided
    if (token === "") {
      await git.clone({
        fs: window.fs,
        http,
        dir: window.dir,
        url,
        corsProxy: "https://cors.isomorphic-git.org",
        ref,
        singleBranch: true,
        depth: 10
      })
    } else {
      await git.clone({
        fs: window.fs,
        http,
        dir: window.dir,
        url,
        corsProxy: "https://cors.isomorphic-git.org",
        ref,
        singleBranch: true,
        depth: 10,
        onAuth: () => ({
          username: token
        })
      })
    }
    console.log("repo cloned")
  }
}

const Auth = ({authorized, setAuthorized}) => {

  const [url, setUrl] = useState("https://source.fetsorn.website/fetsorn/pleiades.git")
  const [ref, setRef] = useState("main")
  const [token, setToken] = useState("")

  // clone git repo and hide authorization
  async function authorize(url, ref, token) {
    try {
      await gitInit(url, ref, token)
      setAuthorized(true)
    } catch (e) {
      console.log(e)
    }
  }

  // save credentials to sessionStorage and authorize
  const login = async () => {

    window.sessionStorage.setItem('url', url)
    window.sessionStorage.setItem('ref', ref)
    window.sessionStorage.setItem('token', token)

    await authorize(url, ref, token)
  }

  // attempt to authorize if sessionStorage has credentials
  useEffect(() => {
    // ignore git authorization if served from local
    const { REACT_APP_BUILD_MODE } = process.env;
    if (REACT_APP_BUILD_MODE === "local") {
      setAuthorized(true)
    }
    let storeUrl = window.sessionStorage.getItem('url')
    let storeRef = window.sessionStorage.getItem('ref')
    let storeToken = window.sessionStorage.getItem('token')

    console.log("store", storeUrl, storeRef, storeToken)

    if (storeToken != null) {
      console.log("try to authorize")
      authorize(storeUrl, storeRef, storeToken)
    }
  }, [])

  return (
    <>
      <Main>
        <div>AUTHORIZATION</div>
        <br/>
        <form>
          <label>git repo:
            <input className={styles.input} type="text" value={url} onChange={(e) => setUrl(e.target.value)}/>
          </label>
          <br/>
          <label>branch:
            <input className={styles.input} type="text" value={ref} onChange={(e) => setRef(e.target.value)}/>
          </label>
          <br/>
          <label>token:
            <input className={styles.input} type="text" value={token} onChange={(e) => setToken(e.target.value)}/>
          </label>
        </form>
        <br/>
        <Button type="button" onClick={login}>Login</Button>
      </Main>
      <Footer />
    </>
  )
}

export default Auth
