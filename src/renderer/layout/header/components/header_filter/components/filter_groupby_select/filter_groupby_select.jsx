import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/index.js';
import styles from './filter_groupby_select.module.css';
import {
  Dropdown,
} from '@/components/index.js';

export function FilterGroupBySelect({
  
}) {
  const { i18n, t } = useTranslation();

  const [
		groupBy,
		queries,
    schema,
    onQueryAdd,
		changeGroupBy,
		setGroupBy,
  ] = useStore((state) => [
		state.groupBy,
		state.queries,
    state.schema,
    state.onQueryAdd,
		state.changeGroupBy,
		state.setGroupBy,
  ]);
	


// const addedField = Object.keys(queries)

// const menuItems = Object.keys(schema)
//   .filter(key => !addedField.includes(key)) 
//   .map(key => ({
//     onClick: () => {
//       onQueryAdd(key, "");
//     },
//     label: key
//   }));

const options = ["reponame", "option", "option-2"]

  return (
		<select
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
  );
}
