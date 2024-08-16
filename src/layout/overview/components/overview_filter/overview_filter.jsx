import React from "react";
import { FilterQueryList, FilterQueryPlus } from "./components/index.js";
import styles from "./overview_filter.module.css";

export function OverviewFilter() {
  return (
    <div className={styles.panel}>
      <FilterQueryList />

      <FilterQueryPlus />
    </div>
  );
}
