import React from "react";

export default function DropdownItemButton({ idx: any, onSelect: any }) {
  return (
    <button
      key={idx}
      className={styles.menuItem}
      onClick={handleClick(item.onClick)}
    >
      {item.label}
    </button>
  );
}
