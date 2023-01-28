import React from "react";
import { useParams , useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QueryListLabel } from "..";
import styles from "./filter_query_list.module.css";
import { useStore } from "../../../../../../store";

export default function FilterQueryList() {
  const { t } = useTranslation();

  const { repoRoute } = useParams();

  const navigate = useNavigate();

  const onChangeQuery = useStore((state) => state.onChangeQuery)

  const queries = useStore((state) => state.queries)

  const onQueryRemove = useStore((state) => state.onQueryRemove)

  return (
    <div className={styles.query}>
      {Object.keys(queries).map((prop: any, idx: any) => (
        <div key={idx} className={styles.queries}>
          <QueryListLabel {...{ prop }} value={queries[prop]} />

          <a
            title={t("header.button.remove", { field: prop })}
            onClick={() => onQueryRemove(navigate, repoRoute, onChangeQuery, prop)}
            style={{ marginLeft: "5px", color: "red", cursor: "pointer" }}
          >
            X
          </a>
        </div>
      ))}
    </div>
  );
}
