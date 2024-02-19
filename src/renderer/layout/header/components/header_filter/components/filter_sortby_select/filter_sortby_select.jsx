import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/index.js';
import styles from './filter_sortby_select.module.css';

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

export function FilterSortBySelect({
  
}) {
  const { i18n, t } = useTranslation();

  const [
	sortBy,
    schema,
		base,
		setSortBy,
  ] = useStore((state) => [
		state.sortBy,
    state.schema,
		state.base,
		state.setSortBy,
  ]);
  
	
	const options = filterLeaves(schema, base).concat([base])
	

  return (
		<label htmlFor={`selectSortBy`}>
			{t('header.dropdown.sortBy')}
		<select
					id={`selectSortBy`}
          value={sortBy}
          onChange={({ target: { value } }) => {
						setSortBy(value)					
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
