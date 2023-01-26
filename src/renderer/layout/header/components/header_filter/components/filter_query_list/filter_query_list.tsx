import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QueryListLabel } from "..";
import styles from "./filter_query_list.module.css";
import { useStore } from "../../../../../../store";
import { useFilterStore } from "../../header_filter_store";

export default function FilterQueryList() {
  const { t } = useTranslation();

  const { repoRoute } = useParams();

  const onChangeQuery = useStore((state) => state.onChangeQuery)

  const queries = useFilterStore((state) => state.queries)

  const onQueryRemove = useFilterStore((state) => state.onQueryRemove)

  return (
    <div className={styles.query}>
      {Object.keys(queries).map((prop: any, idx: any) => (
        <div key={idx} className={styles.queries}>
          <QueryListLabel {...{ prop }} value={queries[prop]} />

          <a
            title={t("header.button.remove", { field: prop })}
            onClick={() => onQueryRemove(repoRoute, onChangeQuery, prop)}
            style={{ marginLeft: "5px", color: "red", cursor: "pointer" }}
          >
            X
          </a>
        </div>
      ))}
    </div>
  );
}
