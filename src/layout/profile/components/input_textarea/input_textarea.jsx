import React from "react";
import styles from "./input_textarea.module.css";

export function InputTextarea({ branch, value, onFieldChange }) {
  return (
    <textarea
      className={styles.inputtext}
      value={value}
      onChange={(e) => onFieldChange(branch, e.target.value)}
    />
  );
}
