import styles from './Tree.module.css'

import { useEffect, useState, useMemo, createRef } from 'react'
import { Header, Button } from '@components'
import { ged2dot, ged2dot_, fetchDataMetadir } from '@utils'

async function dot2svg(dot) {

  // render dot notation with graphviz
  var hpccWasm = window["@hpcc-js/wasm"];
  var svg = await hpccWasm.graphviz.layout(dot, "svg", "dot")

  return svg
}


const Tree = () => {
  const [data, setData] = useState("")
  const [dataLoading, setDataLoading] = useState([])
  const [html, setHtml] = useState("")
  const [depth, setDepth] = useState(4)
  const [isTree, setIsTree] = useState(true)
  const rootInput = createRef()

  const render = async () => {
    var root = rootInput.current.value
    var dot = ged2dot(data, root, depth)
    setHtml(await dot2svg(dot))
  }

  useEffect( () => {
    async function setTree() {
      try {
        let index = await fetchDataMetadir("index.ged")
        setData(index)
        let dot = ged2dot_(index)
        setHtml(await dot2svg(dot))
      } catch(e1) {
        try {
          let index = await fetchDataMetadir("index.html")
          setHtml(index)
          setIsTree(false)
        } catch (e2) {
          console.log(e1, e2)
        }
      }
    }
    setTree()
    setDataLoading(false)
  }, [])

  return (
    <>
      <Header />
      {isTree && (
        <div>
          <input type="text" ref={rootInput} id="rootInput" value="F0001" onChange={(e) => {
            render()
          }}/>
          <div>Depth: {depth}</div>
          <input type="range" min="1" max="10" value={depth} onChange={(e) => {
            setDepth(e.target.value)
            render()
          }}/>
        </div>
      )}
      <div className={styles.container} dangerouslySetInnerHTML={{ __html: html }}></div>
    </>
  )
}

export default Tree
