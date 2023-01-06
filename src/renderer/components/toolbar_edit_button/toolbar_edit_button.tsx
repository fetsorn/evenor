import React from "react";
import { Button } from "..";
import { useTranslation } from "react-i18next";

interface IToolbarEditButtonProps {
  onEdit: any;
}

export default function ToolbarEditButton({ onEdit }: IToolbarEditButtonProps) {
  const { t } = useTranslation();

  return (
    <Button type="button" title={t("line.button.edit")} onClick={onEdit}>
      ✏️
    </Button>
  );
}
