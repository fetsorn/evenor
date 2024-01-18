import React from 'react';
import { FilterBaseSelect, FilterGroupBySelect, FilterQueryList, FilterQueryPlus } from './components/index.js';
import styles from './overview_filter.module.css';

export function OverviewFilter() {

  return (
    <div className={styles.panel}>
			<FilterBaseSelect/>
      		<FilterQueryList />
			<FilterQueryPlus/>
			<FilterGroupBySelect/>
    </div>
  );
}
