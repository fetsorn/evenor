import styles from './Row.module.css'

const Row = ({ data, isFirst, isLast, ...props }) => {
  const date = Array.from(data.date.match(/\d+/g))
    .reverse()
    .join('.')

  return (
    <div className={styles.row} {...props}>
      <h2 className={styles.date}>{date} {isFirst && 'First'}{isLast && 'Last'}</h2>
    </div>
  )
}

export default Row
