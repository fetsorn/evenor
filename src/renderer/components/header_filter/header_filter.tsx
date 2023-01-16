import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FilterSearchBar, FilterQueryList } from "..";
import styles from "./header_filter.module.css";

interface IHeaderFilterProps {
  schema?: any;
}

function paramsToQueries(searchParams: URLSearchParams) {
  return Array.from(searchParams).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {}
  );
}

function queriesToParams(params: any) {
  const searchParams = new URLSearchParams();

  Object.keys(params).map((key) =>
    params[key] !== "" ? searchParams.set(key, params[key]) : null
  );

  return searchParams;
}

export default function HeaderFilter({
  schema: rawSchema,
}: IHeaderFilterProps) {
  const [queries, setQueries]: any[] = useState({});

  const navigate = useNavigate();

  const location = useLocation();

  const [selected, setSelected] = useState("");

  const [searched, setSearched] = useState("");

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

  function onQueryAdd() {
    if (searched) {
      const queriesNew = { ...queries, [selected]: searched };

      setQueriesLocation(queriesNew);
    }
  }

  function onQueryRemove(removed: string) {
    const queriesNew: any = { ...queries };

    delete queriesNew[removed];

    setQueriesLocation(queriesNew);
  }

  function onChangeSelected(selectedNew: string) {
    setSelected(selectedNew);
  }

  function onChangeSearched(searchedNew: string) {
    setSearched(searchedNew);
  }

  function setQueriesLocation(queriesNew: any) {
    const searchParams = queriesToParams(queriesNew);

    navigate({
      pathname: location.pathname,
      search: "?" + searchParams.toString(),
    });
  }

  function onLocation() {
    const searchParams = new URLSearchParams(location.search);

    const queriesNew = paramsToQueries(searchParams);

    setQueries(queriesNew);
  }

  async function onUseEffect() {
    setSelected(notAddedFields?.[0]?.name);
  }

  useEffect(() => {
    onLocation();
  }, [location]);

  useEffect(() => {
    onUseEffect();
  }, []);

  return (
    <div className={styles.panel}>
      <FilterSearchBar
        {...{
          notAddedFields,
          onQueryAdd,
          selected,
          searched,
          onChangeSelected,
          onChangeSearched,
        }}
      />

      <FilterQueryList {...{ queries, onQueryRemove }} />
    </div>
  );
}
