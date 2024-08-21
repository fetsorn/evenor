import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { API } from "@/api/index.js";
import { useStore } from "@/store/index.js";
import styles from "./filter_query_list.module.css";

/**
 * return leaves of base
 * @name filterLeaves
 * @function
 * @param {object} schema - structure data base.
 * @param {string} base - field of schema.
 * @returns {string[]} - list of lieaves of base
 */
function findLeaves(schema, base) {
  // how to find all leaves of base. It should return all branches that have trunk === base when you select the plus button(base)
  return Object.keys(schema).filter((branch) => schema[branch].trunk === base);
}

export function FilterQueryList() {
  const { t } = useTranslation();

  const [queries, setQuery, repo, schema] = useStore((state) => [
    state.queries,
    state.setQuery,
    state.repo,
    state.schema,
  ]);

  const { repo: repoUUID } = repo;

  const { _: base } = queries;

  const api = new API(repoUUID);

  const [options, setOptions] = useState([]);

  const leaves = findLeaves(schema, base);

  async function onFocus(branch) {
    if (branch === "_") {
      setOptions(Object.keys(schema));

      return;
    }

    if (branch === ".sortBy" || branch === "__") {
      setOptions(leaves);

      return;
    }

    setOptions([]);

    const searchParams = new URLSearchParams();

    searchParams.set("_", branch);

    const optionsNew = await api.select(searchParams);

    const optionValues = optionsNew.map((record) => record[branch]);

    setOptions([...new Set(optionValues)]);
  }

  const canDelete = (field) => field !== ".sortBy" && field !== "_";

  return (
    <div className={styles.queries}>
      {Object.keys(queries).map((field) => (
        <div
          key={`querylist-${field ?? Math.random()}`}
          className={styles.query}
        >
          <label htmlFor={`input-${field}`}>
            {field}

            {canDelete(field) && (
              <button
                type="button"
                title={t("header.button.remove", { field })}
                onClick={() => setQuery(field, undefined)}
                style={{ marginLeft: "5px", color: "red", cursor: "pointer" }}
              >
                X
              </button>
            )}

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
