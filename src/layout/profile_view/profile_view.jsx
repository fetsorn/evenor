import React from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { schemaRoot } from "@/api/index.js";
import { Button } from "@/components/index.js";
import { useStore } from "@/store/index.js";
import { ViewRecord } from "./components/index.js";
import styles from "./profile_view.module.css";
import { API } from '../../api/index.js';

export function ProfileView() {
  const { t } = useTranslation();

  const [
    record,
    repo,
    setRepoUUID,
    onRecordUpdate,
    onRecordSelect,
    onRecordDelete,
    isSettings,
    schemaRepo,
  ] = useStore((state) => [
    state.record,
    state.repo,
    state.setRepoUUID,
    state.onRecordUpdate,
    state.onRecordSelect,
    state.onRecordDelete,
    state.isSettings,
    state.schema,
  ]);

  const { repo: repoUUID } = repo;

  const schema = isSettings ? schemaRoot : schemaRepo;

  // const notSingleRepo = __BUILD_MODE__ !== "server";

  const isHomeScreen = repoUUID === "root";

  // const canOpenRepo = isHomeScreen && notSingleRepo;
  const canOpenRepo = isHomeScreen;

  const onRepoOpen = () => setRepoUUID(record.repo);


  const onZip = async () => {
    const api = new API(repoUUID);

    await api.zip();
  }

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
                title={t("line.button.close")}
                onClick={() => onRecordSelect(undefined)}
              >
                {"<"}
              </Button>

              <Button
                type="button"
                title={t("line.button.delete")}
                onClick={() => onRecordDelete()}
              >
                🗑️
              </Button>

              <Button
                type="button"
                title={t("line.button.edit")}
                onClick={() => onRecordUpdate(record)}
              >
                ✏️
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

            {canOpenRepo && (
              <button
                type="button"
                title="zip"
                onClick={() => onRepoOpen()}
              >
               zip
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
