import React from "react";
import styles from "./title.module.css";

export function Title({ children }) {
  return <h2 className={styles.title}>{children}</h2>;
}
