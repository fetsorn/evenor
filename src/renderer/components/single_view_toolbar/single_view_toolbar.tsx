import React from "react";
import { ToolbarEditButton, ToolbarDeleteButton } from "..";
import styles from "./single_view_toolbar.module.css";

interface ISingleViewToolbarProps {
  onEdit: any;
  onDelete: any;
}

export default function SingleViewToolbar({
  onEdit,
  onDelete,
}: ISingleViewToolbarProps) {
  return (
    <div className={styles.buttonbar}>
      <ToolbarEditButton {...{ onEdit }} />

      <ToolbarDeleteButton {...{ onDelete }} />
    </div>
  );
}
