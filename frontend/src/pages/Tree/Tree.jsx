import styles from './Tree.module.css'

import { useEffect, useState, useMemo } from 'react'
import { Header } from '@components'
import { ged2dot } from '@utils'

import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs'
import git from 'isomorphic-git'

async function fetchData() {
  try {

    var restext

    const { REACT_APP_BUILD_MODE } = process.env;

    if (REACT_APP_BUILD_MODE === "local") {
      // fetch cache
      var res = await fetch(`/api/hosts/index.ged`)
      restext = await res.text()
    } else {
      var files = await window.pfs.readdir(window.dir);
      // console.log("read files", files)
      if (files.includes("index.ged")) {
        restext = new TextDecoder().decode(await window.pfs.readFile(window.dir + '/index.ged'));
        // console.log("read files", files)
      } else {
        console.error("Cannot load file. Ensure there is a file called 'index.ged' in the root of the repository.");
      }
    }

    return restext

  } catch (e) {
    console.error(e)
  }
}

async function transformData(restext) {
  // convert gedcom to dot notation
  var dot = ged2dot(restext)
  // console.log(dot)

  // render dot notation with graphviz
  var hpccWasm = window["@hpcc-js/wasm"];
  var svg = await hpccWasm.graphviz.layout(dot, "svg", "dot")
  // console.log(svg)

  return svg
}


const Tree = () => {
  const [data, setData] = useState([])
  const [dataLoading, setDataLoading] = useState([])

  useEffect( () => {
    async function setTree() {
      var restext = await fetchData()
      var svg = await transformData(restext)
      setData(svg)
    }
    setTree()
    setDataLoading(false)
  }, [])

  return (
    <>
      <Header />
      <div className={styles.container} dangerouslySetInnerHTML={{ __html: data }}></div>
    </>
  )
}

export default Tree
