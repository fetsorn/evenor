import React, { useEffect, useState } from "react";
import styles from "./overview_itinerary.module.css";
import {
  ItineraryCreateButton,
  VirtualScroll,
  ItineraryWaypoint,
  buildItinerary,
} from "..";

interface IOverviewItineraryProps {
  overview: any;
  onEntrySelect: any;
  onEntryCreate: any;
  onBatchSelect: any;
}

export default function OverviewItinerary({
  overview,
  onEntrySelect,
  onEntryCreate,
  onBatchSelect,
}: IOverviewItineraryProps) {
  const [itinerary, setItinerary] = useState<any>([]);

  async function onUseEffect() {
    /* const groupByLabel = getGroupByLabel(schema, groupBy); */

    const _itinerary = await buildItinerary(overview, "REPO_NAME");

    setItinerary(_itinerary);
  }
  useEffect(() => {
    onUseEffect();
  }, [overview]);

  return (
    <div className={styles.timeline}>
      {!itinerary.length ? (
        <ItineraryCreateButton date="" index="1" {...{ onEntryCreate }} />
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
