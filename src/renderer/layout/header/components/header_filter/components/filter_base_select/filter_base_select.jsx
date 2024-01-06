import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/index.js';
import styles from './filter_base_select.module.css';

export function FilterBaseSelect({
  
}) {
  const { i18n, t } = useTranslation();

  const [
		base,
    schema,
		setBase,
  ] = useStore((state) => [
		state.base,
    state.schema,
		state.setBase,
  ]);
	

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
