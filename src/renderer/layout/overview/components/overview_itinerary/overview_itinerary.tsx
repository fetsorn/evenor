import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./overview_itinerary.module.css";
import { VirtualScroll } from "@/components";
import { useStore } from "@/store";
import { ItineraryWaypoint } from "./components";
import { buildItinerary } from "./overview_itinerary_controller";

export default function OverviewItinerary() {
  const [itinerary, setItinerary] = useState<any>([]);

  const { t } = useTranslation();

  const [
    entry,
    schema,
    overview,
    groupBy,
    onEntrySelect,
    onEntryCreate,
    onBatchSelect
  ]  = useStore((state) => [
    state.entry,
    state.schema,
    state.overview,
    state.groupBy,
    state.onEntrySelect,
    state.onEntryCreate,
    state.onBatchSelect
  ])

  async function onUseEffect() {
    const groupByLabel = schema[groupBy]?.label;
    
    const itineraryNew = await buildItinerary(overview, groupByLabel);

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
          onClick={() => onEntryCreate("", "1")}
          title={t("line.button.add")}
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
