import { useState } from 'react'
import cn from 'classnames'
import styles from './DropdownMenu.module.css'

const DropdownMenu = ({ label, menuItems }) => {
  const [opened, setOpened] = useState(false)

  const toggle = () => {
    setOpened(!opened)
  }

  const handleClick = (callback) => {
    return () => {
      setOpened(false)
      callback()
    }
  }

  return (
    <div class={styles.dropdown}>
      <button class={cn(styles.dropdownButton, { [styles.opened]: opened })} onClick={toggle}>{label}</button>
      <div class={cn(styles.menu, { [styles.opened]: opened })}>
        {menuItems.map((item) => (
          <button class={styles.menuItem} onClick={handleClick(item.onClick)}>{item.label}</button>
        ))}
      </div>
    </div>
  )
}

export default DropdownMenu
