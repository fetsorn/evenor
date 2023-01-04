import React from "react";
import Draggable from "react-draggable";

export default function Graph({ html: string }) {
  return (
    <Draggable cancel=".node">
      <div
        className={styles.csv}
        dangerouslySetInnerHTML={{ __html: html }}
      ></div>
    </Draggable>
  );
}
