import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components";
import { queryOptions } from "@/api";
import { useStore } from "@/store";
import styles from "./filter_search_bar.module.css";

export default function FilterSearchBar() {
  const { t } = useTranslation();

  const [queryField, setQueryField] = useState("")

  const [queryValue, setQueryValue] = useState("")

  const [options, setOptions]: any[] = useState([]);

  const [
    queries,
    schema,
    onQueryAdd,
    isInitialized,
    repoRoute
  ] = useStore((state) => [
    state.queries,
    state.schema,
    state.onQueryAdd,
    state.isInitialized,
    state.repoRoute
  ]);

  const notAddedBranches = Object.keys(schema).filter(
    (branch: any) =>
      !Object.prototype.hasOwnProperty.call(queries, branch)
  );

  async function onQueryFieldChange() {
    if (isInitialized) {
      const options: any = await queryOptions(repoRoute, queryField);

      const optionValues = options.map((entry: any) => entry[queryField])

      setOptions(optionValues);
    }
  }

  useEffect(() => {
    setQueryField(notAddedBranches?.[0]);

    setQueryValue("")
  }, [schema, queries]);

  useEffect(() => {
    onQueryFieldChange();
  }, [queryField]);

  return (
    <div className={styles.search}>
      <select
        name="searchBarDropdown"
        value={queryField}
        title={t("header.dropdown.search", { field: queryField })}
        onChange={({ target: { value } }) => {
          setQueryField(value);

          setOptions([]);
        }}
      >
        {notAddedBranches.map((branch: any, idx: any) => (
          <option key={idx} value={branch}>
            {branch}
          </option>
        ))}
      </select>

      <div className={styles.form}>
        <input
          className={styles.input}
          type="text"
          list={`panel_list`}
          value={queryValue}
          onChange={({ target: { value } }) => {
            setQueryValue(value);
          }}
        />

        <datalist id={`panel_list`}>
          {options.map((option: any, idx: any) => (
            <option key={idx} value={option}></option>
          ))}
        </datalist>
      </div>

      <Button
        type="button"
        title={t("header.button.search")}
        onClick={() => onQueryAdd(queryField, queryValue)}
      >
        🔎
      </Button>
    </div>
  );
}
