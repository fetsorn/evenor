import React, { useState } from "react";
import cn from "classnames";
import styles from "./DropdownMenu.module.css";

interface IDropdownMenuProps {
  label?: string;
  title?: string;
  menuItems?: any;
}

const DropdownMenu = ({ label, title, menuItems }: IDropdownMenuProps) => {
  const [opened, setOpened] = useState(false);

  const toggle = () => {
    setOpened(!opened);
  };

  const handleClick = (callback: () => unknown) => {
    return () => {
      setOpened(false);
      callback();
    };
  };

  return (
    <div title={title} className={styles.dropdown}>
      <button
        className={cn(styles.dropdownButton, { [styles.opened]: opened })}
        onClick={toggle}
      >
        {label}
      </button>
      <div className={cn(styles.menu, { [styles.opened]: opened })}>
        {menuItems.map((item: any, idx: any) => (
          <button
            key={idx}
            className={styles.menuItem}
            onClick={handleClick(item.onClick)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;
