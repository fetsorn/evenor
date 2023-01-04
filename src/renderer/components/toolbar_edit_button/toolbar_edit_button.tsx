import React from "react";

export default function SidebarEditButton({ onEdit: any }) {
  return (
    <Button type="button" title={t("line.button.edit")} onClick={onEdit}>
      ✏️
    </Button>
  );
}
