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
    overview,
    onEntrySelect,
    onEntryCreate,
    onBatchSelect,
  ] = useStore((state) => [
      state.entry,
      state.overview,
      state.onEntrySelect,
      state.onEntryCreate,
      state.onBatchSelect,
    ]
  );
										console.log();
  return (
    <div className={styles.timeline}>
      {!overview.length ? (
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
          data={overview}
          rowComponent={ListingItem}
        />
      )}
    </div>
  );
}
