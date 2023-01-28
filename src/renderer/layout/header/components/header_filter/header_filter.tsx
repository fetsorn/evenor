import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FilterSearchBar, FilterQueryList } from "./components";
import styles from "./header_filter.module.css";
import { useStore } from "../../../../store";

export default function HeaderFilter() {
  const location = useLocation();

  const rawSchema = useStore((state) => state.schema)

  const onLocation = useStore((state) => state.onLocationFilter)

  const queries = useStore((state) => state.queries)

  const onChangeSelected = useStore((state) => state.onChangeSelected)

  const schema = useMemo(
    () =>
      rawSchema
        ? Object.keys(rawSchema).reduce(
          (acc, key) => [...acc, { ...rawSchema[key], name: key }],
          []
        )
        : [],
    [rawSchema]
  );

  const notAddedFields = useMemo(
    () =>
      schema.filter(
        (item: any) =>
          !Object.prototype.hasOwnProperty.call(queries, item.name) &&
          item.type !== "array"
      ),
    [schema, queries]
  );

  useEffect(() => {
    onChangeSelected(notAddedFields?.[0]?.name);
  }, [schema, queries]);

  useEffect(() => {
    onLocation(location.search);
  }, [location]);

  return (
    <div className={styles.panel}>
      <FilterSearchBar {...{ notAddedFields }} />

      <FilterQueryList />
    </div>
  );
}
