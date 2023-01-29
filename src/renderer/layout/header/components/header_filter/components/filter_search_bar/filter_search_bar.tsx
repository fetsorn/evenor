import React, { useEffect, useState, useMemo } from "react";
import { useParams , useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../../../components";
import { queryOptions } from "../../../../../../api";
import { useStore } from "../../../../../../store";
import styles from "./filter_search_bar.module.css";

export default function FilterSearchBar() {
  const { t } = useTranslation();

  const { repoRoute } = useParams();

  const navigate = useNavigate();

  const [selected, setSelected] = useState("")

  const [searched, setSearched] = useState("")

  const [options, setOptions]: any[] = useState([]);

  const queries = useStore((state) => state.queries)

  const rawSchema = useStore((state) => state.schema)

  const onQueryAdd = useStore((state) => state.onQueryAdd)

  const isLoaded = useStore((state) => state.isLoaded)

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

  async function onSelectedChange() {
    if (isLoaded) {
      const options = await queryOptions(repoRoute, selected);

      setOptions(options);
    }
  }

  useEffect(() => {
    setSelected(notAddedFields?.[0]?.name);

    setSearched("")
  }, [schema, queries]);

  useEffect(() => {
    onSelectedChange();
  }, [selected]);

  return (
    <div className={styles.search}>
      <select
        name="searchBarDropdown"
        value={selected}
        title={t("header.dropdown.search", { field: selected })}
        onChange={({ target: { value } }) => setSelected(value)}
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
          value={searched}
          onChange={({ target: { value } }) => {
            setSearched(value);
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
        onClick={() => onQueryAdd(navigate, repoRoute, selected, searched)}
      >
        🔎
      </Button>
    </div>
  );
}
