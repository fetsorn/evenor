import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./form_url_input.module.css";

interface IFormUrlInputProps {
  formUrl: any;
  onSetUrl: any;
}

export default function FormUrlInput({
  formUrl,
  onSetUrl,
}: IFormUrlInputProps) {
  const { t } = useTranslation();

  return (
    <input
      className={styles.input}
      type="text"
      value={formUrl}
      title={t("list.field.url")}
      onChange={(e) => onSetUrl(e.target.value)}
    />
  );
}
