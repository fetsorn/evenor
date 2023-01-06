import React from "react";
import { Button } from "..";
import { useTranslation } from "react-i18next";

interface IHeaderExportButtonProps {
  onExport: any;
}

export default function HeaderExportButton({
  onExport,
}: IHeaderExportButtonProps) {
  const { t } = useTranslation();

  return (
    <Button type="button" title={t("header.button.export")} onClick={onExport}>
      📃
    </Button>
  );
}
