import React from "react";
import styles from "./Paragraph.module.css";

interface IParagraphProps {
  children?: React.ReactNode;
}

export default function Paragraph({ children }: IParagraphProps) {
  return <p className={styles.paragraph}>{children}</p>;
}
