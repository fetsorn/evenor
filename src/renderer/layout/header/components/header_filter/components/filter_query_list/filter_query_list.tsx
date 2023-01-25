import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { QueryListLabel } from "..";
import styles from "./filter_query_list.module.css";

interface IFilterQueryListProps {
  queries: any;
  onQueryRemove: any;
}

export default function FilterQueryList({
  queries,
  onQueryRemove,
}: IFilterQueryListProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.query}>
      {Object.keys(queries).map((prop: any, idx: any) => (
        <div key={idx} className={styles.queries}>
          <QueryListLabel {...{ prop }} value={queries[prop]} />

          <a
            title={t("header.button.remove", { field: prop })}
            onClick={() => onQueryRemove(prop)}
            style={{ marginLeft: "5px", color: "red", cursor: "pointer" }}
          >
            X
          </a>
        </div>
      ))}
    </div>
  );
}
