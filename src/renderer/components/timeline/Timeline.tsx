import React from 'react'
import styles from './Timeline.module.css'

interface ITimelineProps {
  children?: React.ReactNode;
}

const Timeline = ({ children }: ITimelineProps) => (
  <div className={styles.timeline}>
          {!data.length && (
            <button
              className={rowStyles.star}
              style={{ backgroundColor: "blue" }}
              type="button"
              onClick={() => addEvent("", "1")}
              title={t("line.button.add")}
              key="addevent"
            >
              +
            </button>
          )}
    {children}</div>
          <VirtualScroll
            data={line}
            rowComponent={Row}
            rowHeight={rowHeight}
            onEventClick={handleOpenEvent}
            addEvent={addEvent}
          />
)

export default Timeline
