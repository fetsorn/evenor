import React, { useEffect, useState, useMemo } from "react";
import { QueryListLabel, QueryListRemoveButton } from "..";
import styles from "./filter_query_list.module.css";

interface IFilterQueryListProps {
  queries: any;
  onQueryRemove: any;
}

export default function FilterQueryList({
  queries,
  onQueryRemove,
}: IFilterQueryListProps) {
  return (
    <div className={styles.query}>
      {Object.keys(queries).map((prop: any, idx: any) => (
        <div key={idx} className={styles.queries}>
          <QueryListLabel {...{ prop }} value={queries[prop]} />

          <QueryListRemoveButton {...{ prop, onQueryRemove }} />
        </div>
      ))}
    </div>
  );
}
