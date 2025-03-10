import React from "react";
import styles from "./input_date.module.css";

export function InputDate({ branch, value, onFieldChange }) {
  return (
    <input
      className={styles.input}
      type="date"
      value={value}
      onChange={(e) => onFieldChange(branch, e.target.value)}
    />
  );
}
