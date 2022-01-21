import styles from './GEDCOM.module.css'

import { useEffect, useState, useMemo } from 'react'
import { ged2dot } from '@utils'

import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs'
import git from 'isomorphic-git'

// import hpccWasm from '@hpcc-js/wasm'

const GEDCOM = () => {
  const [data, setData] = useState([])
  const [dataLoading, setDataLoading] = useState([])

  useEffect( () => {
    async function fetchData() {
    try {

      // fetch cache
      // var res = await fetch(`/api/hosts/index.json`)
      // var restext = await res.text()

      // clone cache
      var fs = new LightningFS('fs', {
        wipe: true
      });
      // console.log("fs initialized")
      var pfs = fs.promises;
      var dir = "/gedcom";
      await pfs.mkdir(dir);
      // console.log("dir created")
      await git.clone({
        fs,
        http,
        dir,
        url: "https://source.fetsorn.website/fetsorn/royals.git",
        corsProxy: "https://cors.isomorphic-git.org",
        ref: "master",
        singleBranch: true,
        depth: 10,
      });
      // console.log("cloned")
      var files = await pfs.readdir(dir);
      // console.log("read files", files)
      var restext
      if (files.includes("ROYALS.GED")) {
        restext = new TextDecoder().decode(await pfs.readFile(dir + '/ROYALS.GED'));
        // console.log("read files", files)
      } else {
        console.error("Cannot load file. Ensure there is a file called 'index.json' in the root of the repository.");
      }

      var dot = ged2dot(restext)
      console.log(dot)

      // render with dotviz
      var hpccWasm = window["@hpcc-js/wasm"];
      var svg = await hpccWasm.graphviz.layout(dot, "svg", "dot")
      console.log(svg)

      // filter cache by query and set timeline data
      setData(svg)
    } catch (e) {
      console.error(e)
    }
    }
    fetchData()
    setDataLoading(false)
  }, [])

  return (
    <div className={styles.container} dangerouslySetInnerHTML={{ __html: data }}></div>
  )
}

export default GEDCOM
