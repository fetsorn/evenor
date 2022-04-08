import { useEffect, useState, useMemo, createRef } from 'react'
import { graphviz } from "@hpcc-js/wasm";
import { Header, Button } from '@components'
import { ged2dot, ged2dot_, fetchDataMetadir } from '@utils'
import styles from './Tree.module.css'

async function dot2svg(dot) {

  // render dot notation with graphviz
  var svg = await graphviz.layout(dot, "svg", "dot")

  return svg
}

const Tree = () => {
  const [data, setData] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [html, setHtml] = useState("")
  const [depth, setDepth] = useState(4)
  const [isTree, setIsTree] = useState(false)
  const rootInput = createRef()

  const render = async () => {
    var root = rootInput.current.value
    var dot = ged2dot(data, root, depth)
    setHtml(await dot2svg(dot))
  }

  const reloadPage = async () => {

    setIsLoading(true)

    try {
      let index = await fetchDataMetadir("index.ged")
      setData(index)
      let dot = ged2dot_(index)
      setHtml(await dot2svg(dot))
      setIsTree(true)
    } catch(e1) {
      console.log(e1)
      try {
        let index = await fetchDataMetadir("index.html")
        setHtml(index)
      } catch (e2) {
        console.log(e2)
      }
    }
    setIsLoading(false)
  }

  useEffect( () => {
    reloadPage()
  }, [])

  return (
    <>
      <Header reloadPage={reloadPage} />
      { isLoading && (
        <p>Loading...</p>
      )}
      {isTree && (
        <div>
          <input type="text"
                 ref={rootInput}
                 id="rootInput"
                 value="F0001"
                 onChange={render}/>
          <div>Depth: {depth}</div>
          <input type="range"
                 min="1" max="10"
                 value={depth}
                 onChange={(e) => {
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
