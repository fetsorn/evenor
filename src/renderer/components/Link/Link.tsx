import React from 'react'
import styles from './Link.module.css'

interface ILinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
  props?: any;
}

const Link = ({ children, ...props }: ILinkProps) => (
  <a className={styles.link} {...props}>{children}</a>
)

export default Link
