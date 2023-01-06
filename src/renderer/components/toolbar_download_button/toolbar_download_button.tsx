import React from "react";
import { useTranslation } from "react-i18next";

interface IToolbarDownloadButtonProps {
  onDownload: any;
}

export default function ToolbarDownloadButton({
  onDownload,
}: IToolbarDownloadButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      title={t("list.button.download")}
      onClick={onDownload}
    >
      ⬇
    </button>
  );
}
