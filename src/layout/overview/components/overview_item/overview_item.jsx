import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store/index.js";
import cn from "classnames";
import styles from "./overview_item.module.css";
import { ViewRecord } from "../index.js";
import { Spoiler } from "@/layout/components/index.js";

export function OverviewItem({ record, isLast, index, ...others }) {
  const { i18n, t } = useTranslation();

  const [confirmation, setConfirmation] = useState(false);

  const [schema, onRecordDelete, onRecordInput] = useStore((state) => [
    state.schema,
    state.onRecordDelete,
    state.onRecordInput,
  ]);

  const description =
    schema?.[record._]?.description?.[i18n.resolvedLanguage] ?? record._;

  // TODO add delete
  return (
    <p className={cn(styles.row, { [styles.last]: isLast })} {...others}>
      {Object.keys(record).map((key) => {
        if (key === "_") return undefined;

        const descriptionItem =
          schema?.[key]?.description?.[i18n.resolvedLanguage] ?? key;

        const value = record[key];

        const isString = typeof value === "string";

        const valueShort = value.length > 200 ? value.slice(0, 200) : value;

        const item = isString ? (
          <span key={key}>
            {key === record._ ? value.slice(0, 5) : valueShort}
            <span> </span>
          </span>
        ) : undefined;

        return item;
      })}

      <span> </span>

      <a onClick={() => onRecordInput(record)}>edit</a>

      <span> or </span>

      {confirmation ? (
        <span>
          <span>really delete?</span>
          <a
            type="button"
            title={t("line.button.delete")}
            onClick={() => onRecordDelete(record)}
          >
            yes
          </a>
          <span> </span>
          or
          <span> </span>
          <a
            type="button"
            title={t("line.button.delete")}
            onClick={() => setConfirmation(false)}
          >
            no
          </a>
        </span>
      ) : (
        <a
          type="button"
          title={t("line.button.delete")}
          onClick={() => setConfirmation(true)}
        >
          {t("line.button.delete")}
        </a>
      )}

      <span> </span>

      <Spoiler {...{ index, title: "", description }}>
        <ViewRecord
          {...{
            schema,
            index,
            baseRecord: record,
            base: record._,
            record: record,
          }}
        />
      </Spoiler>
    </p>
  );
}
