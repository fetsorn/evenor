import React from 'react'
import styles from './Main.module.css'

interface IMainProps {
  children?: React.ReactNode;
}

const Main = ({ children }: IMainProps) => (
  <main className={styles.main}>{children}</main>
)

export default Main
