import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './overview_listing.module.css';
import { VirtualScroll } from '@/components/index.js';
import { useStore } from '@/store/index.js';
import { listingItem } from './components/index.js';
// import {
//   ListingRow,
// } from './components/index.js';

export function OverviewListing() {
  const [listing, setListing] = useState([]);

  const { t } = useTranslation();

  const [
    entry,
    overview,
    groupBy,
    onEntrySelect,
    onEntryCreate,
    onBatchSelect,
  ] = useStore((state) => [
    state.entry,
    state.overview,
    state.groupBy,
    state.onEntrySelect,
    state.onEntryCreate,
    state.onBatchSelect,
  ]);

  async function onUseEffect() {
    const listingNew = await buildItinerary(overview, groupBy);

    setListing(listingNew);

    if (entry?.UUID) {
      document.getElementById(entry.UUID).scrollIntoView();
    }
  }

  useEffect(() => {
    onUseEffect();
  }, [overview, groupBy]);

  return (
    <div className={styles.timeline}>
      {!listing.length ? (
        <button
          className={styles.star}
          type="button"
          onClick={() => onEntryCreate('', '1')}
          title={t('line.button.add')}
          key="addevent"
        >
          +
        </button>
      ) : (
        <VirtualScroll
          {...{ onEntrySelect, onEntryCreate, onBatchSelect }}
          data={listing}
          rowComponent={listingItem}
        />
      )}
    </div>
  );
}
