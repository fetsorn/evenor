import React from 'react'
import styles from './Timeline.module.css'

interface ITimelineProps {
  children?: React.ReactNode;
}

const Timeline = ({ children }: ITimelineProps) => (
  <div className={styles.timeline}>{children}</div>
)

export default Timeline
