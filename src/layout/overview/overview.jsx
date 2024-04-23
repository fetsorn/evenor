import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { useStore } from "@/store/index.js";
import { Button } from "@/components/index.js";
import styles from "./overview.module.css";
import { OverviewFilter, OverviewItem, VirtualScroll } from "./components/index.js";

export function Overview() {
  const { t } = useTranslation();

  const [
    repo,
    sortBy,
    record,
    records,
    setRepoUUID,
    onSettingsOpen,
    onRecordSelect,
    onRecordEdit,
  ] = useStore(
    (state) => [
      state.repo,
      state.sortBy,
      state.record,
      state.records,
      state.setRepoUUID,
      state.onSettingsOpen,
      state.onRecordSelect,
      state.onRecordEdit,
    ],
  );

  const { repo: repoUUID } = repo;

  const isRepo = repoUUID !== "root";

  // find first available string value for sorting
  function identify(branch, value) {
    // if array, take first item
    const car = Array.isArray(value) ? value[0] : value;

    // it object, take base field
    const key = typeof car === "object" ? car[branch] : car;

    // if undefined, return empty string
    const id = key === undefined ? "" : key;

    return id
  }

  const recordsSorted = records.sort((a, b) => {
    const valueA = identify(sortBy, a[sortBy]);

    const valueB = identify(sortBy, b[sortBy]);

    return valueA.localeCompare(valueB)
  });

  return (
    <div className={cn(styles.page, record ? styles.invisible : undefined)}>
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
            data: recordsSorted,
            onRecordSelect,
            OverviewItem,
          }}
        />
      </div>

      <div className={styles.plus}>
        <button
          type="button"
          title={t("line.button.add")}
          style={{width: "50px", height: "50px"}}
          onClick={() => onRecordEdit()}
        >
          +
        </button>
      </div>
    </div>
  );
}
