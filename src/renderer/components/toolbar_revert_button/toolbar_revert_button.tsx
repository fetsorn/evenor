import React from "react";
import { Button } from "..";
import { useTranslation } from "react-i18next";

interface IToolbarRevertButtonProps {
  onRevert: any;
}

export default function ToolbarRevertButton({
  onRevert,
}: IToolbarRevertButtonProps) {
  const { t } = useTranslation();

  return (
    <Button type="button" title={t("line.button.revert")} onClick={onRevert}>
      ↩
    </Button>
  );
}
