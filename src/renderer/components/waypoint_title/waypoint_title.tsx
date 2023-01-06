import React from "react";
import styles from "./waypoint_title.module.css";
import { Title } from "..";
import { isDate, formatDate } from "./tbn";

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
        <Title>{title}</Title>
      )}
    </>
  );
}
