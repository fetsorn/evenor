import React, { Suspense } from "react";
import { OverviewFilter } from "./components/overview_filter/overview_filter.jsx";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store/index.js";
import { Button } from "@/components/index.js";
import styles from "./overview.module.css";

const OverviewItinerary = React.lazy(
  () => import("./components/overview_itinerary/index.js"),
);

export function Overview() {
  const { t } = useTranslation();

  const [record, repo, setRepoUUID, onSettingsOpen, onRecordUpdate] = useStore(
    (state) => [
      state.record,
      state.repo,
      state.setRepoUUID,
      state.onSettingsOpen,
      state.onRecordUpdate,
    ],
  );

  const { repo: repoUUID } = repo;

  const isRepo = repoUUID !== "root";

  function onHome() {
    setRepoUUID("root");
  }

  return (
    <div className={record ? styles.invisible : ""}>
      <div className={styles.buttonbar}>
        {isRepo ? (
          <Button
            type="button"
            title={t("header.button.back")}
            onClick={() => onHome()}
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

      <Suspense>
        <OverviewItinerary />
      </Suspense>

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
