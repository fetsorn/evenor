import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { Button } from '@components'
import styles from './Panel.module.css'

function params2object(searchParams) {
  let _params = {}
  for (var entry of searchParams.entries()) {
    _params[entry[0]] = entry[1]
  }
  return _params
}

function object2params(_params) {
  let searchParams = new URLSearchParams()
  for (var key of Object.keys(_params)) {
    let value = _params[key]
    if (value != "") {
      searchParams.set(key, value)
    }
  }
  return searchParams
}

const Panel = ({schema, reloadPage}) => {

  const [params, setParams] = useState({})
  const [isShown, setIsShown] = useState(false)
  const navigate = useNavigate();

  const search = async () => {
    let searchParams = object2params(params)
    navigate({
      pathname: window.location.pathname,
      search: "?" + searchParams.toString()
    })
    await reloadPage()
  }

  const showMenu = async () => {
    setIsShown(!isShown)
  }

  const generateInput = (prop) => {
    let root = Object.keys(schema).find(prop => !schema[prop].hasOwnProperty("parent"))

    const remove = () => {
      let _params = {...params}
      delete _params[prop]
      setParams(_params)
    }

    const onChange = (e) => {
      let _params = {...params}
      _params[prop] = e.target.value
      setParams(_params)
    }

    if (prop == root) { return }
    return (
      <div>
        <label>{prop}</label>
        <span onClick={remove}>X</span>
        <br/>
        <input
          className={styles.input}
          type="text"
          value={params[prop]}
          placeholder={prop}
          onChange={onChange}
        />
      </div>
    )
  }

  const generateButton = (prop) => {
    let root = Object.keys(schema).find(prop => !schema[prop].hasOwnProperty("parent"))

    const add = () => {
      let _params = {...params}
      let searchParams = new URLSearchParams(window.location.search)
      let value = searchParams.has(prop) ? searchParams.get(prop) : ""
      _params[prop] = value
      setParams(_params)
      showMenu()
    }

    if (!Object.keys(params).includes(prop) && prop != root) {
      return (
        <button onClick={add}>{prop}</button>
      )
    }
  }

  useEffect( () => {
    let searchParams = new URLSearchParams(window.location.search)
    setParams(params2object(searchParams))
  }, [])

  return (
    <>
      <form className={styles.form}>
        {Object.keys(params).map(generateInput)}
      </form>
      <Button type="button" onClick={showMenu}>+</Button>
      { isShown && (
        <div className="menu">
          {Object.keys(schema).map(generateButton)}
        </div>
      )}
      <Button type="button" onClick={search}>Search</Button>
    </>
  )}

export default Panel
