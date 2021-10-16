import styles from './Link.module.css'

const Link = ({ children, ...props }) => (
  <a className={styles.link} {...props}>{children}</a>
)

export default Link
