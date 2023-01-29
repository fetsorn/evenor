import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FilterSearchBar, FilterQueryList } from "./components";
import styles from "./header_filter.module.css";
import { useStore } from "../../../../store";

export default function HeaderFilter() {
  const location = useLocation();

  const onLocation = useStore((state) => state.onLocationFilter)

  useEffect(() => {
    onLocation(location.search);
  }, [location]);

  return (
    <div className={styles.panel}>
      <FilterSearchBar />

      <FilterQueryList />
    </div>
  );
}
