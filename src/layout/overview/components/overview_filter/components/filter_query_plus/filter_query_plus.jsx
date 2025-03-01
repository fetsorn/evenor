import React from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store/index.js";
import { Dropdown } from "@/layout/components/index.js";
import styles from "./filter_query_plus.module.css";

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
  return Object.keys(schema).filter((branch) =>
    schema[branch].trunks.includes(base),
  );
}

export function FilterQueryPlus({}) {
  const { i18n, t } = useTranslation();

  const [queries, schema, setQuery] = useStore((state) => [
    state.queries,
    state.schema,
    state.setQuery,
  ]);

  const { _: base } = queries;

  // find all fields name
  const leafFields = findLeaves(schema, base).concat([base, ".sortBy", "__"]);
  // find field name which added to filterqueries
  const addedFields = Object.keys(queries);
  // find name fields which is not added to filterqueries
  const notAddedFields = leafFields.filter((key) => !addedFields.includes(key));

  return (
    <div className={styles.search}>
      <select
        value="default"
        style={{ width: 40 }}
        onChange={({ target: { value: leaf } }) => setQuery(leaf, "")}
      >
        <option hidden disabled value="default">
          +
        </option>

        {notAddedFields.map((leaf, index) => (
          <option key={leaf + index} value={leaf}>
            {leaf}
          </option>
        ))}
      </select>
    </div>
  );
}
