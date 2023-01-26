import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
