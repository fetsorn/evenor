import React from "react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { create } from "zustand";
import { schemaRoot } from "../../api";
import { AssetView, Button, Title } from "../../components/index.js";
import { useStore } from "../../store/index.js";
import { EditInput } from "./components/index.js";
import styles from "./profile_single_edit.module.css";

// TODO: replace with Day.js
function isDate(title) {
  return true;
}

// TODO: replace with Day.js
function formatDate(title) {
  return isDate(title) ? title : title;
}

export const useEditStore = create()((set, get) => ({
  mapIsOpen: {},
  openIndex: (index, isOpen) => {
    const { mapIsOpen } = get();

    mapIsOpen[index] = isOpen;

    set({ mapIsOpen });
  },
}));

export function ProfileSingleEdit() {
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

  const title = formatDate(group);

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
            <Title>
              {title} {index}
            </Title>

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

            <EditInput
              {...{
                index: record.UUID,
                record,
                schema,
                onFieldChange: onRecordChange,
                isBaseObject: true,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
