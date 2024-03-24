import React from "react";
import styles from "./link.module.css";

export function Link({ children, ...props }) {
  return (
    <a className={styles.link} {...props}>
      {children}
    </a>
  );
}
