import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { API } from "@/api/index.js";
import { useStore } from "@/store/index.js";
import styles from "./filter_query_list.module.css";

export function FilterQueryList() {
  const { t } = useTranslation();

  const [queries, setQuery, repo] = useStore((state) => [
    state.queries,
    state.setQuery,
    state.repo,
  ]);

  const { repo: repoUUID } = repo;

  const api = new API(repoUUID);

  const [options, setOptions] = useState([]);

  async function onFocus(field) {
    setOptions([]);

    const optionsNew = await api.queryOptions(field);

    const optionValues = optionsNew.map((record) => record[field]);

    setOptions([...new Set(optionValues)]);
  }

  return (
    <div className={styles.queries}>
      {Object.keys(queries).map((field) => (
        <div
          key={`querylist-${field ?? Math.random()}`}
          className={styles.query}
        >
          <label htmlFor={`input-${field}`}>
            {field}

            <button
              type="button"
              title={t("header.button.remove", { field })}
              onClick={() => setQuery(field, undefined)}
              style={{ marginLeft: "5px", color: "red", cursor: "pointer" }}
            >
              X
            </button>

            <br />

            <input
              className={styles.input}
              type="text"
              id={`input-${field}`}
              value={queries[field]}
              list={`panel_list-${field ?? Math.random()}`}
              onFocus={() => onFocus(field)}
              onChange={({ target: { value } }) => {
                setQuery(field, value);
              }}
            />
          </label>
          <datalist id={`panel_list-${field ?? Math.random()}`}>
            {options.map((option) => (
              <option
                key={`panel_list ${option ?? Math.random()}`}
                value={option}
              />
            ))}
          </datalist>
        </div>
      ))}
    </div>
  );
}
