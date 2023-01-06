import React from "react";
import { Button } from "..";
import { useTranslation } from "react-i18next";

interface IToolbarDeleteButtonProps {
  onDelete: any;
}

export default function SidebarDeleteButton({
  onDelete,
}: IToolbarDeleteButtonProps) {
  const { t } = useTranslation();

  return (
    <Button type="button" title={t("line.button.delete")} onClick={onDelete}>
      🗑️
    </Button>
  );
}
