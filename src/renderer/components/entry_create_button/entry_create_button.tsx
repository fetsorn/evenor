import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./entry_create_button.module.css";

interface IEntryCreateButtonProps {
  onEntryCreate: any;
  date: any;
  index: any;
}

export default function EntryCreateButton({
  onEntryCreate,
  date,
  index,
}: IEntryCreateButtonProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* className={styles.add} */}
      <button
        className={styles.star}
        type="button"
        onClick={() => onEntryCreate(date, index)}
        title={t("line.button.add")}
        key="addevent"
      >
        +
      </button>
    </>
  );
}
