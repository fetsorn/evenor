import React from "react";
import { useTranslation } from "react-i18next";

interface IQueryListRemoveButtonProps {
  prop: any;
  onQueryRemove: any;
}

export default function QueryListRemoveButton({
  prop,
  onQueryRemove,
}: IQueryListRemoveButtonProps) {
  const { t } = useTranslation();

  return (
    <a
      title={t("header.button.remove", { field: prop })}
      onClick={() => onQueryRemove(prop)}
      style={{ marginLeft: "5px", color: "red", cursor: "pointer" }}
    >
      X
    </a>
  );
}
