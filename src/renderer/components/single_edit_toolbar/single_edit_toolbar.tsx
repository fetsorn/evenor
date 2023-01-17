import React from "react";
import { ToolbarRevertButton, ToolbarSaveButton } from "..";
import styles from "./single_edit_toolbar.module.css";

interface ISingleEditToolbarProps {
  onRevert: any;
  onSave: any;
}

export default function SingleEditToolbar({
  onRevert,
  onSave,
}: ISingleEditToolbarProps) {
  return (
    <div className={styles.buttonbar}>
      <ToolbarSaveButton {...{ onSave }} />

      <ToolbarRevertButton {...{ onRevert }} />
    </div>
  );
}
