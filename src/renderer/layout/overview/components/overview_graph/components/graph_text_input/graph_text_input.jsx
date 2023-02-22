import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./graph_text_input.module.css";

export default function GraphTextInput({
  family,
  onSetFamily,
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.slider}>
        <input
          type="text"
          value={family}
          title={t("tree.field.id")}
          onChange={async (e) => {
            await onSetFamily(e.target.value);
          }}
        />
      </div>
    </>
  );
}
