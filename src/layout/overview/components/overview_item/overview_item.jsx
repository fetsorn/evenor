import React from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import styles from "./overview_item.module.css";

export function OverviewItem({
  record,
  onRecordSelect,
  onRecordDelete,
  isLast,
  ...others
}) {
  const { t } = useTranslation();

  // TODO add delete
  return (
    <p className={cn(styles.row, { [styles.last]: isLast })} {...others}>
      {Object.keys(record).map((key) => {
        if (key === "_") return undefined;

        const value = record[key];

        const isString = typeof value === "string";

        const label = `${key}: ${value}`;

        const labelShort = label.slice(0, 40);

        const item = isString ? <span key={key}>{labelShort}</span> : undefined;

        return item;
      })}

      <span>{t("line.button.select")}</span>

      <button onClick={() => onRecordSelect(record)}>
        {t("line.button.yes")}
      </button>

      <button
        type="button"
        title={t("line.button.delete")}
        onClick={() => onRecordDelete(record)}
      >
        {t("line.button.delete")}
      </button>
    </p>
  );
}
