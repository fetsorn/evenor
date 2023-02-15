import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components";
import { queryOptions } from "@/api";
import { useStore } from "@/store";
import styles from "./filter_search_bar.module.css";

export default function FilterSearchBar() {
  const { i18n, t } = useTranslation();

  const [queryField, setQueryField] = useState("")

  const [queryValue, setQueryValue] = useState("")

  const [options, setOptions]: any[] = useState([]);

  const [
    queries,
    schema,
    base,
    onQueryAdd,
    isInitialized,
    repoRoute
  ] = useStore((state) => [
    state.queries,
    state.schema,
    state.base,
    state.onQueryAdd,
    state.isInitialized,
    state.repoRoute
  ]);

  const notAddedQueries = Object.keys(schema).filter(
    (branch: any) =>
      schema[branch].trunk === base
                && !Object.prototype.hasOwnProperty.call(queries, branch)
  ).map(
    (branch: any) => {
      const description = schema?.[branch]?.description?.[i18n.resolvedLanguage] ?? branch;

      return {
        branch,
        label: `${description} (${branch})`
      }
    }
  );

  async function onQueryFieldChange() {
    if (isInitialized) {
      const options: any = await queryOptions(repoRoute, queryField);

      const optionValues = options.map((entry: any) => entry[queryField])

      setOptions(optionValues);
    }
  }

  useEffect(() => {
    setQueryField(notAddedQueries?.[0]?.branch);

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
        {notAddedQueries.map((query: any, idx: any) => (
          <option key={idx} value={query.branch}>
            {query.label}
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
