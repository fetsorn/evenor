import React from "react";
import { ToolbarEditButton } from "..";
import styles from "./single_view_toolbar.module.css";

interface ISingleViewToolbarProps {
  onEdit: any;
}

export default function SingleViewToolbar({ onEdit }: ISingleViewToolbarProps) {
  return (
    <div className={styles.buttonbar}>
      <ToolbarEditButton {...{ onEdit }} />
    </div>
  );
}
