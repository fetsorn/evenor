import cn from 'classnames'

import { formatDate } from '../../utils'

import styles from './Row.module.css'

const Row = ({ data, onEventClick, isLast, ...props }) => (
  <section className={cn(styles.row, { [styles.last]: isLast })} {...props}>
    <time className={styles.date} dateTime={data.date.slice(1,-1)}>
      {formatDate(data.date)}
    </time>
    <div className={styles.content}>
      <div className={styles.stars}>
        {data.eventLinks.map((link, index) => (
          <button className={styles.star} type="button" onClick={() => onEventClick(link)} key={link}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  </section>
)

export default Row
