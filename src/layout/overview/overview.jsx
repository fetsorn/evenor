import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { useStore } from "@/store/index.js";
import { Button } from "@/layout/components/index.js";
import styles from "./overview.module.css";
import { OverviewFilter, OverviewItem } from "./components/index.js";

export function Overview() {
  const { t } = useTranslation();

  const [repo, schema, queries, record, records, setRepoUUID, onRecordInput] =
    useStore((state) => [
      state.repo,
      state.schema,
      state.queries,
      state.record,
      state.records,
      state.setRepoUUID,
      state.onRecordInput,
    ]);

  const parentRef = React.useRef(null);

  const count = records.length;
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
  });

  const items = virtualizer.getVirtualItems();

  const { repo: repoUUID, reponame } = repo;

  const isRepo = repoUUID !== "root";

  const sortBy = queries[".sortBy"];

  const { _: base } = queries;

  const leaves = Object.keys(schema).filter((leaf) =>
    schema[leaf].trunks.includes(base),
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

      <div
        ref={parentRef}
        className={styles.overview}
        style={{
          height: 400,
          width: 400,
          overflowY: "auto",
          contain: "strict",
        }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${items[0]?.start ?? 0}px)`,
            }}
          >
            {items.map((virtualRow) => (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
              >
                <div>
                  <OverviewItem record={recordsSorted[virtualRow.index]} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
