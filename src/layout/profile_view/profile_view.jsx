import React from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { API, schemaRoot } from "@/api/index.js";
import { Button } from "@/layout/components/index.js";
import { useStore } from "@/store/index.js";
import { ViewRecord } from "./components/index.js";
import styles from "./profile_view.module.css";

export function ProfileView() {
  const { t } = useTranslation();

  const [record, repo, setRepoUUID, onRecordInput, onRecordSelect, schema] =
    useStore((state) => [
      state.record,
      state.repo,
      state.setRepoUUID,
      state.onRecordInput,
      state.onRecordSelect,
      state.schema,
    ]);

  const { repo: repoUUID } = repo;

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
                title={t("header.button.back")}
                onClick={() => onRecordSelect(undefined)}
              >
                {"<"} {t("header.button.back")}
              </Button>

              <span>{record[record._].slice(0, 20)}...</span>

              <Button
                type="button"
                title={t("line.button.edit")}
                onClick={() => onRecordInput(record)}
              >
                {t("line.button.edit")}
              </Button>
            </div>

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
