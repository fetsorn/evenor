import React from "react";

export default function SidebarRevertButton({ onRevert: any }) {
  return (
    <Button type="button" title={t("line.button.revert")} onClick={onRevert}>
      ↩
    </Button>
  );
}
