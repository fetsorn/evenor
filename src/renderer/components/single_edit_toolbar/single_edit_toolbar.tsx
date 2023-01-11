import React from "react";
import {
  ToolbarRevertButton,
  ToolbarSaveButton,
  ToolbarPropsDropdown,
} from "..";
import styles from "./single_edit_toolbar.module.css";

interface ISingleEditToolbarProps {
  schema: any;
  entry: any;
  onRevert: any;
  onSave: any;
  onAddProp: any;
}

export default function SingleEditToolbar({
  schema,
  entry,
  onRevert,
  onSave,
  onAddProp,
}: ISingleEditToolbarProps) {
  return (
    <div className={styles.buttonbar}>
      <ToolbarRevertButton {...{ onRevert }} />

      <ToolbarPropsDropdown {...{ schema, entry, onAddProp }} />

      <ToolbarSaveButton {...{ onSave }} />
    </div>
  );
}
