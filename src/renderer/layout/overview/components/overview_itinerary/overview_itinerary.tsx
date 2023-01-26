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
} from "./overview_itinerary_controller";
import { useStore } from "../../../../store";

export default function OverviewItinerary() {
  const [itinerary, setItinerary] = useState<any>([]);

  const { t } = useTranslation();

  const onEntrySelect = useStore((state) => state.onEntrySelect)

  const onEntryCreate = useStore((state) => state.onEntryCreate)

  const onBatchSelect = useStore((state) => state.onBatchSelect)

  const overview = useStore((state) => state.overview)

  const groupBy = useStore((state) => state.groupBy)

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
