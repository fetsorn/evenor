import React from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store/index.js";
import { Dropdown } from "@/components/index.js";
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
  return Object.keys(schema).filter((branch) => schema[branch].trunk === base);
}

export function FilterQueryPlus({}) {
  const { i18n, t } = useTranslation();

  const [base, queries, schema, setQuery] = useStore((state) => [
    state.base,
    state.queries,
    state.schema,
    state.setQuery,
  ]);

  // find all fields name
  const leafFields = findLeaves(schema, base).concat([base]);
  // find field name which added to filterqueries
  const addedFields = Object.keys(queries);
  // find name fields which is not added to filterqueries
  const notAddedFields = leafFields.filter((key) => !addedFields.includes(key));
  // transform list of fieldnames(array of strings) to list of objects in dropdown
  const menuItems = notAddedFields.map((key) => ({
    onClick: () => {
      setQuery(key, "");
    },
    label: key,
  }));

  return (
    <div className={styles.search}>
      <Dropdown
        {...{
          label: "+",
          title: "title",
          menuItems,
        }}
      />
    </div>
  );
}
