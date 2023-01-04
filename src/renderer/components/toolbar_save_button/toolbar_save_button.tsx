import React from "react";

export default function SidebarSaveButton({ onSave: any }) {
  return (
    <Button type="button" title={t("line.button.save")} onClick={onSave}>
      💾
    </Button>
  );
}
