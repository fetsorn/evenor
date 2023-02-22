import React from "react";
import Draggable from "react-draggable";
import styles from "./graph_svg.module.css";

export default function GraphSvg({ html }) {
  return (
    <Draggable cancel=".node">
      <div
        className={styles.csv}
        dangerouslySetInnerHTML={{ __html: html }}
      ></div>
    </Draggable>
  );
}
