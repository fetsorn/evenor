import React from 'react';
import { FilterBaseSelect, FilterSortBySelect, FilterQueryListNew, FilterQueryPlus } from './components/index.js';
import styles from './header_filter.module.css';

export function HeaderFilter() {

  return (
    <div className={styles.panel}>
			<FilterBaseSelect/>
      		<FilterQueryListNew />
			<FilterQueryPlus/>
			<FilterSortBySelect/>
    </div>
  );
}
