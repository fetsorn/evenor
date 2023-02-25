import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API } from 'lib/api';
import { Button } from '@/components/index.js';
import { useStore } from '@/store/index.js';
import styles from './filter_search_bar.module.css';

export function FilterSearchBar() {
  const { i18n, t } = useTranslation();

  const [queryField, setQueryField] = useState('');

  const [queryValue, setQueryValue] = useState('');

  const [options, setOptions] = useState([]);

  const [
    queries,
    schema,
    base,
    onQueryAdd,
    isInitialized,
    repoUUID,
  ] = useStore((state) => [
    state.queries,
    state.schema,
    state.base,
    state.onQueryAdd,
    state.isInitialized,
    state.repoUUID,
  ]);

  const api = new API(repoUUID);

  const notAddedQueries = Object.keys(schema).filter(
    (branch) => schema[branch].trunk === base
                && !Object.prototype.hasOwnProperty.call(queries, branch),
  ).map(
    (branch) => {
      const description = schema?.[branch]?.description?.[i18n.resolvedLanguage] ?? branch;

      return {
        branch,
        label: `${description} (${branch})`,
      };
    },
  );

  async function onQueryFieldChange() {
    if (isInitialized) {
      const optionsNew = await api.queryOptions(queryField);

      const optionValues = optionsNew.map((entry) => entry[queryField]);

      setOptions(optionValues);
    }
  }

  useEffect(() => {
    setQueryField(notAddedQueries?.[0]?.branch);

    setQueryValue('');
  }, [schema, queries]);

  useEffect(() => {
    onQueryFieldChange();
  }, [queryField]);

  return (
    <div className={styles.search}>
      <select
        name="searchBarDropdown"
        value={queryField}
        title={t('header.dropdown.search', { field: queryField })}
        onChange={({ target: { value } }) => {
          setQueryField(value);

          setOptions([]);
        }}
      >
        {notAddedQueries.map((query, idx) => (
          <option key={idx} value={query.branch}>
            {query.label}
          </option>
        ))}
      </select>

      <div className={styles.form}>
        <input
          className={styles.input}
          type="text"
          list="panel_list"
          value={queryValue}
          onChange={({ target: { value } }) => {
            setQueryValue(value);
          }}
        />

        <datalist id="panel_list">
          {options.map((option) => (
            <option key={`panel_list ${option ?? Math.random()}`} value={option} />
          ))}
        </datalist>
      </div>

      <Button
        type="button"
        title={t('header.button.search')}
        onClick={() => onQueryAdd(queryField, queryValue)}
      >
        🔎
      </Button>
    </div>
  );
}
