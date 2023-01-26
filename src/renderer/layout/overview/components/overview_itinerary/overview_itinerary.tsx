import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./overview_itinerary.module.css";
import {
  VirtualScroll,
} from "../../../../components";
import {
  ItineraryWaypoint,
} from "./components";
import {
  buildItinerary,
} from "..";

export default function OverviewItinerary() {
  const [itinerary, setItinerary] = useState<any>([]);
  const { t } = useTranslation();

  async function onUseEffect() {
    const itineraryNew = await buildItinerary(overview, groupBy);

    setItinerary(itineraryNew);
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
