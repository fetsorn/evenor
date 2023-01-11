import React from "react";
import { Button } from "..";
import { useTranslation } from "react-i18next";

interface IToolbarCloseButtonProps {
  onClose: any;
}

export default function ToolbarCloseButton({
  onClose,
}: IToolbarCloseButtonProps) {
  const { t } = useTranslation();

  return (
    <Button type="button" title={t("line.button.close")} onClick={onClose}>
      X
    </Button>
  );
}
