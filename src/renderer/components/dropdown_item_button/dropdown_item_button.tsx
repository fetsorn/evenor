import React from "react";
import styles from "./dropdown_item_button.module.css";

interface IDropdownItemButtonProps {
  index: any;
  label: any;
  onSelect: any;
}

export default function DropdownItemButton({
  index,
  label,
  onSelect,
}: IDropdownItemButtonProps) {
  return (
    <button key={index} className={styles.menuItem} onClick={onSelect}>
      {label}
    </button>
  );
}
