import React from "react";
import styles from "./Link.module.css";

interface ILinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
  props?: any;
}

export default function Link({ children, ...props }: ILinkProps) {
  return (
    <a className={styles.link} {...props}>
      {children}
    </a>
  );
}
