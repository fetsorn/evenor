import React from 'react'
import styles from './Button.module.css'

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const Button = (props: IButtonProps) => {
  const {children, ...other} = props
  return (
    <button className={styles.button} {...other}>{children}</button>
  )
}

export default Button
