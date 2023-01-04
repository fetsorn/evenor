import React from "react";

export default function HeaderExportButton({ onExport: any }) {
  return (
    <Button type="button" title={t("header.button.export")} onClick={onExport}>
      📃
    </Button>
  );
}
