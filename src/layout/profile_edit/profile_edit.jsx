import React from "react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { schemaRoot } from "@/api";
import { AssetView, Button } from "@/components/index.js";
import { useStore } from "@/store/index.js";
import { EditRecord } from "./components/index.js";
import styles from "./profile_edit.module.css";

export function ProfileEdit() {
  const { t } = useTranslation();

  const [
    record,
    isSettings,
    onRecordSelect,
    onRecordCreate,
    onRecordUpdate,
    schemaRepo,
  ] = useStore((state) => [
    state.record,
    state.isSettings,
    state.onRecordSelect,
    state.onRecordCreate,
    state.onRecordUpdate,
    state.schema,
  ]);

  const recordBackup = structuredClone(record);

  const schema = isSettings ? schemaRoot : schemaRepo;

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
                title={t("line.button.revert")}
                onClick={() => onRecordSelect(recordBackup)}
              >
                {"<"}
              </Button>

              <Button
                type="button"
                title={t("line.button.save")}
                onClick={() => onRecordCreate()}
              >
                💾
              </Button>
            </div>

            <EditRecord
              {...{
                schema,
                index: "_",
                base: record._,
                record,
                onRecordChange: onRecordUpdate,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
