import React from "react";
import styles from "./Title.module.css";

interface IWaypointTitleProps {
  title?: any;
}

export default function WaypointTitle({ title }: IWaypointTitleProps) {
  return (
    <>
      {isDate(title) ? ( // try to parse as date, otherwise render as is
        <time className={styles.date} dateTime={title.slice(1, -1)}>
          {formatDate(title)}
        </time>
      ) : (
        <Title className={styles.date}>{title}</Title>
      )}
    </>
  );
}
