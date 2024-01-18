import React from 'react';
import styles from './paragraph.module.css';

export function Paragraph({ children }) {
  return <p className={styles.paragraph}>{children}</p>;
}
