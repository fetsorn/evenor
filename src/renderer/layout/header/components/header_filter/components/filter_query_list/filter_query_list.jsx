import React from 'react';
import { useTranslation } from 'react-i18next';
import { QueryListLabel } from '..';
import styles from './filter_query_list.module.css';
import { useStore } from '@/store';

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
      {Object.keys(queries).map((field, idx) => (
        <div key={idx} className={styles.queries}>
          <QueryListLabel {...{ field }} value={queries[field]} />

          <a
            title={t('header.button.remove', { field })}
            onClick={() => onQueryRemove(field)}
            style={{ marginLeft: '5px', color: 'red', cursor: 'pointer' }}
          >
            X
          </a>
        </div>
      ))}
    </div>
  );
}
