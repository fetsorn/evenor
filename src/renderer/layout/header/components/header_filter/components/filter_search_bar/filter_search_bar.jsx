import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API } from 'lib/api';
import { Button } from '@/components/index.js';
import { OverviewType, useStore } from '@/store/index.js';
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
    repoUUID,
  ] = useStore((state) => [
    state.queries,
    state.schema,
    state.base,
    state.onQueryAdd,
    state.repoUUID,
  ]);

  const api = new API(repoUUID);

  function isConnected(leaf) {
    const { trunk } = schema[leaf];

    return trunk !== undefined && (trunk === base || isConnected(trunk));
  }

  const queriesToAdd = Object.keys(schema).filter(
    (branch) => branch === base || isConnected(branch),
  ).map(
    (branch) => {
      const description = schema?.[branch]?.description?.[i18n.resolvedLanguage] ?? branch;

      return {
        branch,
        label: `${description} (${branch})`,
      };
    },
  ).concat([
    { branch: '_', label: t('header.dropdown.base') },
    { branch: '.group', label: t('header.dropdown.groupby') },
  ]);

  async function onFocus() {
    if (queryField === '_') {
      const roots = Object.keys(schema)
        .filter((branch) => schema[branch].trunk === undefined
                || schema[branch].type === 'object'
                || schema[branch].type === 'array')
        .map((branch) => {
          const description = schema?.[branch]?.description?.[i18n.resolvedLanguage] ?? branch;

          return {
            branch,
            label: `${description} (${branch})`,
          };
        });

      setOptions(roots.map((root) => root.branch));
    } else if (queryField === '.group') {
      const leaves = Object.keys(schema)
        .filter((branch) => (schema[branch].trunk === base
                             || branch === base
                             || schema[schema[branch]?.trunk]?.trunk === base)
                && (branch !== 'schema' && branch !== 'schema_branch'))
        .map((branch) => {
          const description = schema?.[branch]?.description?.[i18n.resolvedLanguage] ?? branch;

          return {
            branch,
            label: `${description} (${branch})`,
          };
        });

      setOptions(leaves.map((leaf) => leaf.branch));
    } else {
      const optionsNew = await api.queryOptions(queryField);

      const optionValues = optionsNew.map((entry) => entry[queryField]);

      setOptions([...new Set(optionValues)]);
    }
  }

  useEffect(() => {
    setQueryField(queriesToAdd?.[0]?.branch);

    setQueryValue('');
  }, [schema, queries]);

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
        {queriesToAdd.map((query) => (
          <option key={`filteroption-${query.branch ?? Math.random()}`} value={query.branch}>
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
          onFocus={onFocus}
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
