import React from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { schemaRoot } from "../../api/index.js";
import { Button } from "../../components/index.js";
import { useStore } from "../../store/index.js";
import { ViewRecord } from "./components/index.js";
import styles from "./profile_view.module.css";

export function ProfileView() {
  const { t } = useTranslation();

  const [
    record,
    repoUUID,
    setRepoUUID,
    onRecordUpdate,
    onRecordSelect,
    onRecordDelete,
    isSettings,
    schemaRepo,
  ] = useStore((state) => [
    state.record,
    state.repoUUID,
    state.setRepoUUID,
    state.onRecordUpdate,
    state.onRecordSelect,
    state.onRecordDelete,
    state.isSettings,
    state.schema,
  ]);

  const schema = isSettings ? schemaRoot : schemaRepo;

  const isHomeScreen = repoUUID === "root";

  // const notSingleRepo = __BUILD_MODE__ !== "server";

  // const canOpenRepo = isHomeScreen && notSingleRepo;
  const canOpenRepo = isHomeScreen;

  const onRepoOpen = () => setRepoUUID(record.repo);

  return (
    <div
      className={cn(
        styles.sidebar,
        { [styles.invisible]: !record },
        "profile-view__sidebar view__sidebar",
      )}
    >
      {record && (
        <div className={cn(styles.container, "view-sidebar__container")}>
          <div
            id="scrollcontainer"
            className={cn(styles.sticky, "view-sidebar__sticky")}
          >
            <div className={cn(styles.buttonbar, "view-sidebar__btn-bar")}>
              <Button
                type="button"
                title={t("line.button.edit")}
                onClick={() => onRecordUpdate(record)}
              >
                ✏️
              </Button>

              <Button
                type="button"
                title={t("line.button.delete")}
                onClick={onRecordDelete}
              >
                🗑️
              </Button>

              <Button
                type="button"
                title={t("line.button.close")}
                onClick={() => onRecordSelect(undefined)}
              >
                X
              </Button>
            </div>

            {canOpenRepo && (
              <button
                type="button"
                title={t("line.button.open")}
                onClick={() => onRepoOpen()}
              >
                {t("line.button.open")}
              </button>
            )}

            <ViewRecord
              {...{
                schema,
                index: "_",
                base: record._,
                record,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
