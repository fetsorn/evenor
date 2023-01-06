import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./form_key_input.module.css";

interface IListTokenInputProps {
  formToken: string;
  onSetToken: any;
}

export default function ListTokenInput({
  formToken,
  onSetToken,
}: IListTokenInputProps) {
  const { t } = useTranslation();

  return (
    <input
      className={styles.input}
      type="password"
      value={formToken}
      title={t("list.field.token")}
      onChange={(e) => onSetToken(e.target.value)}
    />
  );
}
