import React, { useState } from "react";
import cn from "classnames";
import styles from "./dropdown.module.css";

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
      <button className={styles.menuItem} onClick={onOpen}>
        {label}
      </button>

      <div className={cn(styles.menu, { [styles.opened]: opened })}>
        {menuItems.map((item: any, index: any) => (
          <div key={index}>
            <button
              className={cn(styles.dropdownButton, { [styles.opened]: opened })}
              onClick={onSelect(item.onClick)}
            >
              {item.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
