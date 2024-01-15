import React, { useState } from 'react';
import cn from 'classnames';
import styles from './dropdown.module.css';

export function Dropdown({
  label,
  title,
  menuItems,
}) {
  const [opened, setOpened] = useState(false);

  function onOpen() {
    setOpened(!opened);
  }

  function onSelect(callback) {
    return () => {
      setOpened(false);

      callback();
    };
  }

  return (
    <div title={title} className={cn(styles.dropdown, "dropdown")}>
      <button type="button" className={styles.menuItem} onClick={onOpen}>
        {label}
      </button>

      <div className={cn(styles.menu, { [styles.opened]: opened })}>
        {menuItems.map((item) => (
          <div key={`dropdown_${label}_${title}_${Math.random()}`}>
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
