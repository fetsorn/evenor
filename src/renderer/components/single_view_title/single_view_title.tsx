import React from "react";
import styles from "./single_view_title.module.css";
import { Title } from "..";
import { formatDate, isDate } from "./tbn";

interface ISingleViewTitleProps {
  waypoint: any;
  index: any;
}

export default function SingleViewTitle({
  waypoint,
  index,
}: ISingleViewTitleProps) {
  return (
    <>
      {isDate(waypoint) ? ( // try to parse as date, otherwise render as is
        <time className={styles.date} dateTime={waypoint?.slice(1, -1)}>
          {formatDate(waypoint)} {index}
        </time>
      ) : (
        <Title>
          {waypoint} {index}
        </Title>
      )}
    </>
  );
}
