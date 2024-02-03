import React, { useEffect, useState } from 'react';
import { API } from 'lib/api';
import { useTranslation } from 'react-i18next';
import styles from './filter_query_list.module.css';
import { useStore } from '@/store/index.js';

export function FilterQueryListNew() {
  const { t } = useTranslation();

  const [
    queries,
    onQueryRemove,
    onQueryAdd,
  ] = useStore((state) => [
    state.queries,
    state.onQueryRemove,
    state.onQueryAdd,
  ]);
console.log(queries);

async function onFocus() {
	const optionsNew = await api.queryOptions(queryBranch);

	const optionValues = optionsNew.map((entry) => entry[queryBranch]);

	setOptions([...new Set(optionValues)]);
}


  return (
    <div className={styles.queries}>
      {Object.keys(queries).map((field) => (
        <div key={`querylist-${field ?? Math.random()}`} className={styles.query}>
			<select
        name="searchBarDropdown"
        value={queryBranch}
        title={t('header.dropdown.search', { field: queryBranch })}
        onChange={({ target: { value } }) => {
          onQuerySelect(value);

          setOptions([]);
        }}
      ></select>
      <label
        htmlFor={`input-${field}`}
      >
        {field}
          <button
            type="button"
            title={t('header.button.remove', { field })}
            onClick={() => onQueryRemove(field)}
            style={{ marginLeft: '5px', color: 'red', cursor: 'pointer' }}
          >
            X
          </button>
        <br />
        <input
          className={styles.input}
          type="text"
					id={`input-${field}`}
					value={queries[field]}
					onFocus={onFocus}
          onChange={({ target: { value } }) => {
            onQueryAdd(field, value);
          }}
        
        />
      </label>
	  <datalist id="panel_list">
          {options.map((option) => (
            <option key={`panel_list ${option ?? Math.random()}`} value={option} />
          ))}
        </datalist>
        </div>
      ))}
    </div>
  );
}
