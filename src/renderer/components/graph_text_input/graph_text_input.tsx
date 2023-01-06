import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./graph_text_input.module.css";

interface IGraphTextInputProps {
  family: any;
  onSetFamily: any;
}

export default function GraphTextInput({
  family,
  onSetFamily,
}: IGraphTextInputProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.slider}>
        <input
          type="text"
          value={family}
          title={t("tree.field.id")}
          onChange={async (e: any) => {
            await onSetFamily(e.target.value);
          }}
        />
      </div>
    </>
  );
}
