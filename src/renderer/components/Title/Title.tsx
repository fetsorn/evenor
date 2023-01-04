import React from "react";
import styles from "./Title.module.css";

interface ITitleProps {
  children?: React.ReactNode;
}

export default function Title({ children }: ITitleProps) {
  return <h2 className={styles.title}>{children}</h2>;
}
