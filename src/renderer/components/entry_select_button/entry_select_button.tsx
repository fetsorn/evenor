import React from "react";
import { colorExtension } from "./tbn";
import styles from "./entry_select_button.module.css";

interface IEntrySelectButtonProps {
  entry: any;
  index: any;
  onEntrySelect: any;
}

export default function EntrySelectButton({
  entry,
  index,
  onEntrySelect,
}: IEntrySelectButtonProps) {
  return (
    <button
      className={styles.star}
      style={{ backgroundColor: colorExtension(entry) }}
      type="button"
      onClick={() => onEntrySelect(entry, index + 1)}
      title={entry?.FILE_PATH}
      id={entry?.UUID}
      key={entry}
    >
      {index + 1}
    </button>
  );
}
