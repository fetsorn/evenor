import React from "react";
// import cn from 'classnames';
import styles from "./button.module.css";

export function Button(props) {
  const { children, ...other } = props;
  return (
    <button className={styles.button} {...other}>
      {children}
    </button>
  );
}

// <button type="button" className={cn(styles.button, className)} {...other}>
//   {children}
// </button>
