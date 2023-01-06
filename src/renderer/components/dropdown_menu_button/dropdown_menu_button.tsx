import React from "react";
import cn from "classnames";
import styles from "./dropdown_menu_button.module.css";

interface IDropdownMenuButtonProps {
  onOpen: any;
  opened: any;
  label: string;
}

export default function DropdownMenuButton({
  onOpen,
  opened,
  label,
}: IDropdownMenuButtonProps) {
  return (
    <button
      className={cn(styles.dropdownButton, { [styles.opened]: opened })}
      onClick={onOpen}
    >
      {label}
    </button>
  );
}
