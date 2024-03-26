import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./overview_itinerary.module.css";
import { VirtualScroll } from "../../../../components/index.js";
import { useStore } from "../../../../store/index.js";
import { ItineraryWaypoint } from "./components/index.js";
import { buildItinerary } from "./overview_itinerary_controller.js";

export function OverviewItinerary() {
  const [itinerary, setItinerary] = useState([]);

  const { t } = useTranslation();

  const [
    record,
    records,
    sortBy,
    onRecordSelect,
    onRecordCreate,
    onBatchSelect,
  ] = useStore((state) => [
    state.record,
    state.records,
    state.sortBy,
    state.onRecordSelect,
    state.onRecordCreate,
    state.onBatchSelect,
  ]);

  async function onUseEffect() {
    const itineraryNew = await buildItinerary(records, sortBy);

    setItinerary(itineraryNew);

    if (record?.UUID) {
      document.getElementById(record.UUID).scrollIntoView();
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
          onClick={() => onRecordCreate("", "1")}
          title={t("line.button.add")}
          key="addevent"
        >
          +
        </button>
      ) : (
        <VirtualScroll
          {...{ onRecordSelect, onRecordCreate, onBatchSelect }}
          data={itinerary}
          rowComponent={ItineraryWaypoint}
        />
      )}
    </div>
  );
}
