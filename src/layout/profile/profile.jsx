import React from "react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Button } from "@/layout/components/index.js";
import { useStore } from "@/store/index.js";
import { EditRecord } from "./components/index.js";
import styles from "./profile.module.css";

export function Profile() {
  const { t } = useTranslation();

  const [record, onRecordSelect, onRecordUpdate, onRecordInput, schema] =
    useStore((state) => [
      state.record,
      state.onRecordSelect,
      state.onRecordUpdate,
      state.onRecordInput,
      state.schema,
    ]);

  const recordBackup = structuredClone(record);

  return (
    <div
      className={cn(
        styles.sidebar,
        { [styles.invisible]: !record },
        "profile-edit__sidebar edit-sidebar",
      )}
    >
      {record && (
        <div className={cn(styles.container, "edit-sidebar__container")}>
          <div
            id="scrollcontainer"
            className={cn(styles.sticky, "edit-sidebar__sticky")}
          >
            <div className={cn(styles.buttonbar, "edit-sidebar__btn-bar")}>
              <Button
                type="button"
                title={t("header.button.back")}
                onClick={() => onRecordSelect(undefined)}
              >
                {"<"} {t("header.button.back")}
              </Button>

              <span>{record[record._].slice(0, 20)}...</span>

              <Button
                type="button"
                title={t("line.button.save")}
                onClick={() => onRecordUpdate(recordBackup, record)}
              >
                {t("line.button.save")}
              </Button>
            </div>

            <EditRecord
              {...{
                schema,
                index: "_",
                base: record._,
                record,
                onRecordChange: onRecordInput,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
