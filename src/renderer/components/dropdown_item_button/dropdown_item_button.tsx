import React from "react";
import styles from "./dropdown_item_button.module.css";

interface IDropdownItemButtonProps {
  label: any;
  onSelect: any;
}

export default function DropdownItemButton({
  label,
  onSelect,
}: IDropdownItemButtonProps) {
  return (
    <button className={styles.menuItem} onClick={onSelect}>
      {label}
    </button>
  );
}
