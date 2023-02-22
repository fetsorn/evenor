import React from "react";
import styles from "./paragraph.module.css";

export default function Paragraph({ children }) {
  return <p className={styles.paragraph}>{children}</p>;
}
