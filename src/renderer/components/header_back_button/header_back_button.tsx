import React from "react";
import { Button } from "..";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function HeaderBackButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      title={t("header.button.back")}
      onClick={() => navigate(-1)}
    >
      &lt;=
    </Button>
  );
}
