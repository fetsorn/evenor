import React, { useEffect, useState } from "react";
import styles from "./overview_itinerary.module.css";
import {
  ItineraryCreateButton,
  VirtualScroll,
  ItineraryWaypoint,
  buildItinerary,
} from "..";

interface IOverviewItineraryProps {
  groupBy: any;
  overview: any;
  onEntrySelect: any;
  onEntryCreate: any;
  onBatchSelect: any;
}

export default function OverviewItinerary({
  groupBy,
  overview,
  onEntrySelect,
  onEntryCreate,
  onBatchSelect,
}: IOverviewItineraryProps) {
  const [itinerary, setItinerary] = useState<any>([]);

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
