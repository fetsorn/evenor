import React from 'react'
import styles from './Paragraph.module.css'

interface IParagraphProps {
  children?: React.ReactNode;
}

const Paragraph = ({ children }: IParagraphProps) => (
  <p className={styles.paragraph}>{children}</p>
)

export default Paragraph
