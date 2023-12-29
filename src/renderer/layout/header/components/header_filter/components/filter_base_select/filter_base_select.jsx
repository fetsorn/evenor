import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/index.js';
import styles from './filter_base_select.module.css';
import {
  Dropdown,
} from '@/components/index.js';

export function FilterBaseSelect({
  
}) {
  const { i18n, t } = useTranslation();

  const [
		base,
		queries,
    schema,
    onQueryAdd,
		changeBase,
		setBase,
  ] = useStore((state) => [
		state.groupBase,
		state.queries,
    state.schema,
    state.onQueryAdd,
		state.changeBase,
		state.setBase,
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

const options = Object.keys(schema)

  return (
		<label htmlFor={`selectBase`}>
			{t('header.dropdown.base')}
		<select
					id={`selectBase`}
          value={base}
          onChange={({ target: { value } }) => {
						setBase(value)					
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
