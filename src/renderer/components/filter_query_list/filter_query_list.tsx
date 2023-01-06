import React, { useEffect, useState, useMemo } from "react";
import { QueryListLabel, QueryListRemoveButton } from "..";
import styles from "./filter_query_list.module.css";

interface IFilterQueryListProps {
  params: any;
  onQueryRemove: any;
}

export default function FilterQueryList({
  params,
  onQueryRemove,
}: IFilterQueryListProps) {
  return (
    <div className={styles.query}>
      {Object.keys(params).map((prop: any, idx: any) => (
        <div key={idx} className={styles.queries}>
          <QueryListLabel prop={prop} value={params[prop]} />

          <QueryListRemoveButton {...{ prop, onQueryRemove }} />
        </div>
      ))}
    </div>
  );
}
