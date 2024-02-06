import React, { useState } from "react";
import { API } from "lib/api";
import { useTranslation } from "react-i18next";
import styles from "./filter_query_list.module.css";
import { useStore } from "@/store/index.js";

export function FilterQueryListNew() {
  const { t } = useTranslation();

  const [
	queries, 
	onQueryRemove, 
	onQueryAdd, 
	repoUUID] 
  = useStore((state) => [
    state.queries,
    state.onQueryRemove,
    state.onQueryAdd,
	state.repoUUID
  ]);

  const api = new API(repoUUID);

  const [options, setOptions] = useState([]);

  async function onFocus(field) {
	setOptions([])
	console.log(queries);

  	const optionsNew = await api.queryOptions(field);

  	const optionValues = optionsNew.map((entry) => entry[field]);

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
              onClick={() => onQueryRemove(field)}
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
                onQueryAdd(field, value);
              }}
            />
          </label>
          	<datalist id={`panel_list-${field ?? Math.random()}`}>
				{options.map((option) => (
					<option key={`panel_list ${option ?? Math.random()}`} value={option} />
				))}
			</datalist>
        </div>
      ))}
    </div>
  );
}
