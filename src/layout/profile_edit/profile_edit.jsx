import React from "react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { schemaRoot } from "../../api";
import { AssetView, Button, Title } from "../../components/index.js";
import { useStore } from "../../store/index.js";
import { EditRecord, EditPlus } from "./components/index.js";
import styles from "./profile_edit.module.css";

export function ProfileEdit() {
  const { t } = useTranslation();

  const [
    record,
    group,
    index,
    isSettings,
    onRecordRevert,
    onRecordSave,
    onRecordChange,
  ] = useStore((state) => [
    state.record,
    state.group,
    state.index,
    state.isSettings,
    state.onRecordRevert,
    state.onRecordSave,
    state.onRecordChange,
  ]);

  const schema = isSettings ? schemaRoot : useStore((state) => state.schema);

  const title = group;

  return (
    <div
      className={cn(
        styles.sidebar,
        { [styles.invisible]: !record },
        "profile-edit__sidebar edit-sidebar",
      )}
    >
      {record && schema && (
        <div className={cn(styles.container, "edit-sidebar__container")}>
          <div
            id="scrollcontainer"
            className={cn(styles.sticky, "edit-sidebar__sticky")}
          >
            <div className={cn(styles.buttonbar, "edit-sidebar__btn-bar")}>
              <Button
                type="button"
                title={t("line.button.save")}
                onClick={() => onRecordSave()}
              >
                💾
              </Button>

              <Button
                type="button"
                title={t("line.button.revert")}
                onClick={onRecordRevert}
              >
                ↩
              </Button>
            </div>

            <EditRecord
              {...{
                schema,
                index: "_",
                base: record._,
                record,
                onRecordChange,
              }}
            />

            <EditPlus />
          </div>
        </div>
      )}
    </div>
  );
}
