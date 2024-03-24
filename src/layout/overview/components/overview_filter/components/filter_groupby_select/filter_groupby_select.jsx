import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../../../../../store/index.js';
import styles from './filter_groupby_select.module.css';

/**
  * return leaves of base
  * @name filterLeaves
  * @function 
  * @param {object} schema - structure data base.
  * @param {string} base - field of schema.
  * @returns {string[]} - list of lieaves of base
  */

  function filterLeaves(schema, base) {
    // how to find all leaves of base. It should return all branches that have trunk === base when you select the plus button(base)
    return Object.keys(schema).filter((branch) => schema[branch].trunk === base)
    
  }

export function FilterGroupBySelect({
  
}) {
  const { i18n, t } = useTranslation();

  const [
    groupBy,
    schema,
    base,
    setGroupBy,
  ] = useStore((state) => [
    state.groupBy,
    state.schema,
    state.base,
    state.setGroupBy,
  ]);
  
  
  const options = filterLeaves(schema, base).concat([base])
  

  return (
    <label htmlFor={`selectGroupBy`}>
      {t('header.dropdown.groupby')}
    <select
          id={`selectGroupBy`}
          value={groupBy}
          onChange={({ target: { value } }) => {
            setGroupBy(value)          
          }}
        >
          {options.map((field) => (
            <option key={crypto.getRandomValues(new Uint32Array(10)).join('')} value={field}>
              {field}
            </option>
          ))}
        </select>
        </label>
  );
}
