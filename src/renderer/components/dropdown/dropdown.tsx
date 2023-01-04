import React, { useState } from "react";
import cn from "classnames";
import styles from "./DropdownMenu.module.css";

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
      <ButtonDropdownOpen onOpen={toggle} label={label} />

      <div className={cn(styles.menu, { [styles.opened]: opened })}>
        {menuItems.map((item: any, idx: any) => (
          <ButtonDropdownItem idx={idx} onSelect={handleClick(item.onClick)} />
        ))}
      </div>
    </div>
  );
}
