import React from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store/index.js";
import styles from "./filter_sortby_select.module.css";

/**
 * return leaves of base
 * @name filterLeaves
 * @function
 * @param {object} schema - structure data base.
 * @param {string} base - field of schema.
 * @returns {string[]} - list of lieaves of base
 */

function findLeaves(schema, base) {
  // find all leaves of base
  // return all branches that have trunk === base
  // when you select the plus button(base)
  return Object.keys(schema).filter((branch) => schema[branch].trunk === base);
}

export function FilterSortBySelect({}) {
  const { i18n, t } = useTranslation();

  const [sortBy, queries, schema, base, setQuery, records] = useStore(
    (state) => [
      state.sortBy,
      state.queries,
      state.schema,
      state.base,
      state.setQuery,
      state.records,
    ],
  );

  const options = findLeaves(schema, base).concat([base]);

  return (
    <label htmlFor={`selectSortBy`}>
      {t("header.dropdown.sortby")}
      <br/>
      <select
        id={`selectSortBy`}
        value={sortBy}
        style={{width: 100}}
        onChange={({ target: { value } }) => {
          setQuery(".sortBy", value);
        }}
      >
        {options.map((field) => (
          <option
            key={crypto.getRandomValues(new Uint32Array(10)).join("")}
            value={field}
          >
            {field}
          </option>
        ))}
      </select>
    </label>
  );
}
