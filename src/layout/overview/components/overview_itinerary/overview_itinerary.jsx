import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./overview_itinerary.module.css";
import { useStore } from "@/store/index.js";
import { ItineraryWaypoint, VirtualScroll } from "./components/index.js";
import { buildItinerary } from "./overview_itinerary_controller.js";

export function OverviewItinerary() {
  const [itinerary, setItinerary] = useState([]);

  const { t } = useTranslation();

  const [record, records, sortBy, onRecordSelect, onRecordUpdate] = useStore(
    (state) => [
      state.record,
      state.records,
      state.sortBy,
      state.onRecordSelect,
      state.onRecordUpdate,
    ],
  );

  async function onUseEffect() {
    const itineraryNew = await buildItinerary(records, sortBy);

    setItinerary(itineraryNew);

    // if (record?.UUID) {
    //   document.getElementById(record.UUID).scrollIntoView();
    // }
  }

  useEffect(() => {
    onUseEffect();
  }, [records, sortBy]);

  return (
    <div className={styles.timeline}>
      <VirtualScroll
        {...{
          onRecordSelect,
          onRecordCreate: async () => onRecordUpdate(),
          data: itinerary,
          rowComponent: ItineraryWaypoint,
        }}
      />
    </div>
  );
}
