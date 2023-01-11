import React from "react";
import { ToolbarEditButton, ToolbarDeleteButton, ToolbarCloseButton } from "..";
import styles from "./single_view_toolbar.module.css";

interface ISingleViewToolbarProps {
  onEdit: any;
  onClose: any;
  onDelete: any;
}

export default function SingleViewToolbar({
  onEdit,
  onClose,
  onDelete,
}: ISingleViewToolbarProps) {
  return (
    <div className={styles.buttonbar}>
      <ToolbarEditButton {...{ onEdit }} />

      <ToolbarDeleteButton {...{ onDelete }} />

      <ToolbarCloseButton {...{ onClose }} />
    </div>
  );
}
