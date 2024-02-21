import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './overview_itinerary.module.css';
import { VirtualScroll } from '@/components/index.js';
import { useStore } from '@/store/index.js';
import {
  ItineraryWaypoint,
} from './components/index.js';
import { buildItinerary } from './overview_itinerary_controller.js';

export function OverviewItinerary() {
  const [itinerary, setItinerary] = useState([]);

  const { t } = useTranslation();

  const [
    entry,
    records,
    sortBy,
    onEntrySelect,
    onEntryCreate,
    onBatchSelect,
  ] = useStore((state) => [
    state.entry,
    state.records,
    state.sortBy,
    state.onEntrySelect,
    state.onEntryCreate,
    state.onBatchSelect,
  ]);

  async function onUseEffect() {
	  console.log( "useEffect",(records));
    const itineraryNew = await buildItinerary(records, sortBy);

    setItinerary(itineraryNew);

    if (entry?.UUID) {
      document.getElementById(entry.UUID).scrollIntoView();
    }
  }

  useEffect(() => {
    onUseEffect();
  }, [records, sortBy]);

  return (
    <div className={styles.timeline}>
      {!itinerary.length ? (
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
          data={itinerary}
          rowComponent={ItineraryWaypoint}
        />
      )}
    </div>
  );
}
