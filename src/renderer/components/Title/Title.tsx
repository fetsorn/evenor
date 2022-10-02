import React from 'react'
import styles from './Title.module.css'

interface ITitleProps {
  children?: React.ReactNode;
}

const Title = ({ children }: ITitleProps) => (
  <h2 className={styles.title}>{children}</h2>
)

export default Title
