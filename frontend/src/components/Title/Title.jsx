import styles from './Title.module.css'

const Title = ({ children }) => (
  <h2 className={styles.title}>{children}</h2>
)

export default Title
