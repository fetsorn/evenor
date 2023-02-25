import React from 'react';
import { useTranslation } from 'react-i18next';
import { QueryListLabel } from '..';
import styles from './filter_query_list.module.css';
import { useStore } from '@/store/index.js';

export function FilterQueryList() {
  const { t } = useTranslation();

  const [
    queries,
    onQueryRemove,
  ] = useStore((state) => [
    state.queries,
    state.onQueryRemove,
  ]);

  return (
    <div className={styles.query}>
      {Object.keys(queries).map((field) => (
        <div key={`querylist-${field ?? Math.random()}`} className={styles.queries}>
          <QueryListLabel {...{ field }} value={queries[field]} />

          <button
            type="button"
            title={t('header.button.remove', { field })}
            onClick={() => onQueryRemove(field)}
            style={{ marginLeft: '5px', color: 'red', cursor: 'pointer' }}
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
}
