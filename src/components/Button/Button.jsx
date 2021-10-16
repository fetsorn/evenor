import styles from './Button.module.css'

const Button = ({ children, ...props }) => (
  <button className={styles.button} {...props}>{children}</button>
)

export default Button
