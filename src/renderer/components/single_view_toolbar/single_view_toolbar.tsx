import React from "react";
import { ToolbarEditButton } from "..";

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
