import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './filter_query_list.module.css';
import { useStore } from '../../../../../../store/index.js';

export function FilterQueryList() {
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


  return (
    <div className={styles.queries}>
      {Object.keys(queries).map((field) => (
        <div key={`querylist-${field ?? Math.random()}`} className={styles.query}>
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
          onChange={({ target: { value } }) => {
            onQueryAdd(field, value);
          }}
        
        />
      </label>
          
        </div>
      ))}
    </div>
  );
}
