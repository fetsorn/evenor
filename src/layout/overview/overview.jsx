import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { useStore } from "@/store/index.js";
import { Button } from "@/layout/components/index.js";
import styles from "./overview.module.css";
import {
  OverviewFilter,
  OverviewItem,
  VirtualScroll,
} from "./components/index.js";

export function Overview() {
  const { t } = useTranslation();

  const [
    repo,
    schema,
    queries,
    record,
    records,
    setRepoUUID,
    onRecordSelect,
    onRecordDelete,
    onRecordInput,
  ] = useStore((state) => [
    state.repo,
    state.schema,
    state.queries,
    state.record,
    state.records,
    state.setRepoUUID,
    state.onRecordSelect,
    state.onRecordDelete,
    state.onRecordInput,
  ]);

  const { repo: repoUUID, reponame } = repo;

  const isRepo = repoUUID !== "root";

  const sortBy = queries[".sortBy"];

  const { _: base } = queries;

  const leaves = Object.keys(schema).filter(
    (leaf) => schema[leaf].trunk === base,
  );

  // if base is twig, it has no connections
  const isTwig = leaves.length === 0;

  // we can add new values only if base has connections
  const canAdd = !isTwig;

  // find first available string value for sorting
  function identify(branch, value) {
    // if array, take first item
    const car = Array.isArray(value) ? value[0] : value;

    // it object, take base field
    const key = typeof car === "object" ? car[branch] : car;

    // if undefined, return empty string
    const id = key === undefined ? "" : key;

    return id;
  }

  const recordsSorted = records.sort((a, b) => {
    const valueA = identify(sortBy, a[sortBy]);

    const valueB = identify(sortBy, b[sortBy]);

    return valueA.localeCompare(valueB);
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
            {"<"} {t("header.button.back")}
          </Button>
        ) : (
          <div />
        )}

        {isRepo ? <p>{reponame}</p> : ""}

        {canAdd && (
          <div>
            <Button
              type="button"
              title={t("line.button.add")}
              className={styles.plusbutton}
              onClick={() => onRecordInput()}
            >
              +
            </Button>
          </div>
        )}
      </div>

      <OverviewFilter />

      <div className={styles.overview}>
        <VirtualScroll
          {...{
            data: recordsSorted,
            onRecordSelect,
            onRecordDelete,
            OverviewItem,
          }}
        />
      </div>
    </div>
  );
}
