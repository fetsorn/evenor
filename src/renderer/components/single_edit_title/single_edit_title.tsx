import React from "react";
import styles from "./single_edit_title.module.css";
import { Title } from "..";

// TODO: replace with Day.js
function isDate(title: string): boolean {
  return true;
}

// TODO: replace with Day.js
function formatDate(title: string): string {
  return title;
}

interface ISingleEditTitleProps {
  group: any;
  index: any;
}

export default function SingleEditTitle({
  group,
  index,
}: ISingleEditTitleProps) {
  return (
    <>
      {isDate(group) ? ( // try to parse as date, otherwise render as is
        <time className={styles.date} dateTime={group?.slice(1, -1)}>
          {formatDate(group)} {index}
        </time>
      ) : (
        <Title>
          {group} {index}
        </Title>
      )}
    </>
  );
}
