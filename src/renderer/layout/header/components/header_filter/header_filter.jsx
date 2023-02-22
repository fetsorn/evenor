import React from "react";
import { FilterSearchBar, FilterQueryList } from "./components";
import styles from "./header_filter.module.css";

export default function HeaderFilter() {
  return (
    <div className={styles.panel}>
      <FilterSearchBar />

      <FilterQueryList />
    </div>
  );
}
