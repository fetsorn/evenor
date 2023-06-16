import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '/src/renderer/layout/overview/components/overview_itinerary/overview_itinerary.module.css';
import { VirtualScroll } from '/src/renderer/components/virtual_scroll/virtual_scroll';
import { useStore } from '/src/renderer/store/store';
import {
  ItineraryWaypoint,
} from '/src/renderer/layout/overview/components/overview_itinerary/components/index';
import { buildItinerary } from '/src/renderer/layout/overview/components/overview_itinerary/overview_itinerary_controller.js';

export function Empty() {

  return (
    <div>aaa</div>
  );

}

export function OverviewListing() {
  const [itinerary, setItinerary] = useState([]);

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
    const itineraryNew = await buildItinerary(overview, groupBy);

    setItinerary(itineraryNew);

    if (entry?.UUID) {
      document.getElementById(entry.UUID).scrollIntoView();
    }
  }

  useEffect(() => {
    onUseEffect();
  }, [overview, groupBy]);

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
          rowComponent={Empty}
        />
      )}
    </div>
  );
}
