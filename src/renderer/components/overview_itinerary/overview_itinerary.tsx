import React from "react";
import styles from "./overview_itinerary.module.css";
import { EntryAddButton, VirtualScroll, ItineraryWaypoint } from "..";

interface IOverviewItineraryProps {
  data: any;
  onEntrySelect: any;
  onEntryCreate: any;
  onBatchSelect: any;
}

export default function OverviewItinerary({
  data,
  onEntrySelect,
  onEntryCreate,
  onBatchSelect,
}: IOverviewItineraryProps) {
  return (
    <div className={styles.timeline}>
      {!data.length ? (
        <EntryAddButton {...{ onEntryCreate }} />
      ) : (
        <VirtualScroll
          {...{ data, onEntrySelect, onEntryCreate, onBatchSelect }}
          rowComponent={ItineraryWaypoint}
        />
      )}
    </div>
  );
}
