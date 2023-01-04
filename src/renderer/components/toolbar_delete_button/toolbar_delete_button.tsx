import React from "react";

export default function SidebarDeleteButton({ onDelete: any }) {
  return (
    <Button type="button" title={t("line.button.delete")} onClick={onDelete}>
      🗑️
    </Button>
  );
}
