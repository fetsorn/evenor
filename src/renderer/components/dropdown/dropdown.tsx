import React, { useState } from "react";
import cn from "classnames";
import styles from "./dropdown.module.css";
import { DropdownMenuButton, DropdownItemButton } from "..";

interface IDropdownMenuProps {
  label?: string;
  title?: string;
  menuItems?: any;
}

export default function DropdownMenu({
  label,
  title,
  menuItems,
}: IDropdownMenuProps) {
  const [opened, setOpened] = useState(false);

  function onOpen() {
    setOpened(!opened);
  }

  function onSelect(callback: () => unknown) {
    return () => {
      setOpened(false);

      callback();
    };
  }

  return (
    <div title={title} className={styles.dropdown}>
      <DropdownMenuButton {...{ onOpen, opened, label }} />

      <div className={cn(styles.menu, { [styles.opened]: opened })}>
        {menuItems.map((item: any, index: any) => (
          <DropdownItemButton
            {...{ index }}
            label={item.label}
            onSelect={onSelect(item.onClick)}
          />
        ))}
      </div>
    </div>
  );
}
