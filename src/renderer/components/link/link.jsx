import React from "react";
import styles from "./link.module.css";

export default function Link({ children, ...props }) {
  return (
    <a className={styles.link} {...props}>
      {children}
    </a>
  );
}
