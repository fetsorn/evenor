import React from "react";
import styles from "./button.module.css";

export default function Button(props) {
  const { children, ...other } = props;
  return (
    <button className={styles.button} {...other}>
      {children}
    </button>
  );
}
