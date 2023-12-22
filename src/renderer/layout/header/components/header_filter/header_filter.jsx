import React from 'react';
import { FilterQueryListNew, FilterQueryPlus } from './components/index.js';
import styles from './header_filter.module.css';

export function HeaderFilter() {

  return (
    <div className={styles.panel}>
      <FilterQueryListNew />
			<FilterQueryPlus/>
    </div>
  );
}
