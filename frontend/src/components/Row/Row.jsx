import cn from 'classnames'

import { formatDate, colorExtension } from '@utils'

import styles from './Row.module.css'

const Row = ({ data, onEventClick, isLast, ...props }) => (
  <section className={cn(styles.row, { [styles.last]: isLast })} {...props}>
    {data.date.match(/\d+/g) && (
      <div>
        <time className={styles.date} dateTime={data.date.slice(1,-1)}>
          {formatDate(data.date)}
        </time>
        <div className={styles.content}>
          <div className={styles.stars}>
            {data.events.map((event, index) => (
              <button
                className={styles.star}
                style={{"backgroundColor":colorExtension(event)}}
                type="button"
                onClick={() => onEventClick(event, index + 1)}
                title={event?.FILE_PATH}
                key={event}>
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
  </section>
)

export default Row
