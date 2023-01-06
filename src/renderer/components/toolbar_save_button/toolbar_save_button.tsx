import React from "react";
import { Button } from "..";
import { useTranslation } from "react-i18next";

interface IToolbarSaveButtonProps {
  onSave: any;
}

export default function ToolbarSaveButton({ onSave }: IToolbarSaveButtonProps) {
  const { t } = useTranslation();

  return (
    <Button type="button" title={t("line.button.save")} onClick={onSave}>
      💾
    </Button>
  );
}
