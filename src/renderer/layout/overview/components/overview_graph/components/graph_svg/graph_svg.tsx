import React from "react";
import Draggable from "react-draggable";
import styles from "./graph_svg.module.css";

interface IGraphSvgProps {
  html: any;
}

export default function GraphSvg({ html }: IGraphSvgProps) {
  return (
    <Draggable cancel=".node">
      <div
        className={styles.csv}
        dangerouslySetInnerHTML={{ __html: html }}
      ></div>
    </Draggable>
  );
}
