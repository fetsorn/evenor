import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './overview_listing.module.css';
import { VirtualScroll } from '@/components/index.js';
import { useStore } from '@/store/index.js';
import {
  ListingItem
} from './components/index.js';

export function OverviewListing() {
  const [itinerary, setItinerary] = useState([]);

  const { t } = useTranslation();

  const [
    entry,
    records,
    onEntrySelect,
    onEntryCreate,
    onBatchSelect,
  ] = useStore((state) => [
      state.entry,
      state.records,
      state.onEntrySelect,
      state.onEntryCreate,
      state.onBatchSelect,
    ]
  );
  return (
    <div className={styles.timeline}>
      {!records.length ? (
        <button
          className={styles.star}
          type="button"
          onClick={() => onEntryCreate('', '1')}
          title={t('line.button.add')}
          key="addevent"
        >
        </button>
      ) : (
        <VirtualScroll
          {...{
            onEntrySelect,
            onEntryCreate,
            onBatchSelect
          }}
          data={records}
          rowComponent={ListingItem}
        />
      )}
    </div>
  );
}
