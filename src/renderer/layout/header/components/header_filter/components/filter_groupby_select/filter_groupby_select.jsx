import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/index.js';
import styles from './filter_groupby_select.module.css';


export function FilterGroupBySelect({
  
}) {
  const { i18n, t } = useTranslation();

  const [
		groupBy,
    schema,
		setGroupBy,
  ] = useStore((state) => [
		state.groupBy,
    state.schema,
		state.setGroupBy,
  ]);
	
const options = Object.keys(schema)
console.log(schema);

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
