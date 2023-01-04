import React from "react";

export default function DropdownOpenButton({ onOpen: any, label: string }) {
  return (
    <button
      className={cn(styles.dropdownButton, { [styles.opened]: opened })}
      onClick={onOpen}
    >
      {label}
    </button>
  );
}
