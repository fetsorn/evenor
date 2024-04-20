import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store/index.js";
import { Button } from "@/components/index.js";
import styles from "./overview.module.css";
import { OverviewFilter, OverviewItem, VirtualScroll } from "./components/index.js";

export function Overview() {
  const { t } = useTranslation();

  const [
    record,
    records,
    repo,
    setRepoUUID,
    onSettingsOpen,
    onRecordSelect,
    onRecordUpdate
  ] = useStore(
    (state) => [
      state.record,
      state.records,
      state.repo,
      state.setRepoUUID,
      state.onSettingsOpen,
      state.onRecordSelect,
      state.onRecordUpdate,
    ],
  );

  const { repo: repoUUID } = repo;

  const isRepo = repoUUID !== "root";

  return (
    <div className={record ? styles.invisible : ""}>
      <div className={styles.buttonbar}>
        {isRepo ? (
          <Button
            type="button"
            title={t("header.button.back")}
            onClick={() => setRepoUUID("root")}
          >
            {/* &lt;= */}
            {"<"}
          </Button>
        ) : (
          <div />
        )}

        {isRepo && (
          <Button
            type="button"
            title={t("header.button.back")}
            onClick={onSettingsOpen}
          >
            ⚙️
          </Button>
        )}
      </div>

      <OverviewFilter />

      <div className={styles.overview}>
        <VirtualScroll
          {...{
            data: records,
            onRecordSelect,
            OverviewItem,
          }}
        />
      </div>

      <button
        type="button"
        title={t("line.button.add")}
        onClick={() => onRecordUpdate()}
      >
        +
      </button>
    </div>
  );
}
