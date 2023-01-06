import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "..";

interface ISearchBarButtonProps {
  onQueryAdd: any;
}

export default function SearchBarButton({ onQueryAdd }: ISearchBarButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      type="button"
      title={t("header.button.search")}
      onClick={onQueryAdd}
    >
      🔎
    </Button>
  );
}
