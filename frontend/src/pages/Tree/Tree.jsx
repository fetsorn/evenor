import styles from './Tree.module.css'

import { useEffect, useState, useMemo, createRef } from 'react'
import { Header, Button, StringToJSX } from '@components'
import { ged2dot, ged2dot_ } from '@utils'

import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs'
import git from 'isomorphic-git'

async function fetchData() {
  try {

    var restext

    const { REACT_APP_BUILD_MODE } = process.env;

    if (REACT_APP_BUILD_MODE === "local") {
      // fetch cache
      var res = await fetch(`/api/index.ged`)
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

async function dot2svg(dot) {

  // render dot notation with graphviz
  var hpccWasm = window["@hpcc-js/wasm"];
  var svg = await hpccWasm.graphviz.layout(dot, "svg", "dot")

  return svg
}


const Tree = () => {
  const [data, setData] = useState("")
  const [dataLoading, setDataLoading] = useState([])
  const [svg, setSvg] = useState("")
  const [depth, setDepth] = useState(4)
  const rootInput = createRef()

  const render = async () => {
    var root = rootInput.current.value
    var dot = ged2dot(data, root, depth)
    setSvg(await dot2svg(dot))
  }

  useEffect( () => {
    async function setTree() {
      var restext = await fetchData()
      setData(restext)
      var dot = ged2dot_(restext)
      setSvg(await dot2svg(dot))
    }
    setTree()
    setDataLoading(false)
  }, [])

  return (
    <>
      <Header />
      <input type="text" ref={rootInput} id="rootInput" value="F0001" onChange={(e) => {
        render()
      }}/>
      <div>Depth: {depth}</div>
      <input type="range" min="1" max="10" value={depth} onChange={(e) => {
        setDepth(e.target.value)
        render()
      }}/>
      <div className={styles.container} dangerouslySetInnerHTML={{ __html: svg }}></div>
    </>
  )
}

export default Tree
