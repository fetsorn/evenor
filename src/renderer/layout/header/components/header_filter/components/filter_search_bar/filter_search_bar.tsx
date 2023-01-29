import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../../../components";
import { queryOptions } from "../../../../../../api";
import { useStore } from "../../../../../../store";
import styles from "./filter_search_bar.module.css";

export default function FilterSearchBar() {
  const { t } = useTranslation();

  const { repoRoute } = useParams();

  const [queryField, setQueryField] = useState("")

  const [queryValue, setQueryValue] = useState("")

  const [options, setOptions]: any[] = useState([]);

  const [
    queries,
    rawSchema,
    onQueryAdd,
    isInitialized
  ] = useStore((state) => [
    state.queries,
    state.schema,
    state.onQueryAdd,
    state.isInitialized
  ]);

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

  async function onQueryFieldChange() {
    if (isInitialized) {
      const options = await queryOptions(repoRoute, queryField);

      setOptions(options);
    }
  }

  useEffect(() => {
    setQueryField(notAddedFields?.[0]?.name);

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
        onChange={({ target: { value } }) => setQueryField(value)}
      >
        {notAddedFields.map((field: any, idx: any) => (
          <option key={idx} value={field.name}>
            {field.name}
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
