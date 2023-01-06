import React from "react";
import { Button } from "..";
import { useTranslation } from "react-i18next";

interface IFormCreateButtonProps {
  onCreate: any;
}

export default function FormCreateButton({ onCreate }: IFormCreateButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      type="button"
      title={t("list.button.new")}
      onClick={onCreate}
    ></Button>
  );
}
