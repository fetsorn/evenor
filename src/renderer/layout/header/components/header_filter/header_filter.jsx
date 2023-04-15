import React, { useState } from 'react';
import { FilterSearchBar, FilterQueryList } from './components/index.js';
import styles from './header_filter.module.css';

export function HeaderFilter() {
  const [queryBranch, setQueryBranch] = useState('');

  const [queryValue, setQueryValue] = useState('');

  function onQueryInput(value) {
    setQueryValue(value);
  }

  function onQuerySelect(value) {
    setQueryBranch(value);
  }

  return (
    <div className={styles.panel}>
      <FilterSearchBar {...{
        queryBranch,
        onQuerySelect,
        queryValue,
        onQueryInput,
      }}
      />

      <FilterQueryList {...{ onQuerySelect }} />
    </div>
  );
}
