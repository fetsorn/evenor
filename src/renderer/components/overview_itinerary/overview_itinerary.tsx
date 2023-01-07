import React, { useEffect, useState } from "react";
import styles from "./overview_itinerary.module.css";
import { EntryCreateButton, VirtualScroll, ItineraryWaypoint } from "..";
import { onUseEffect } from "./tbn";

interface IOverviewItineraryProps {
  schema: any;
  groupBy: any;
  overview: any;
  onEntrySelect: any;
  onEntryCreate: any;
  onBatchSelect: any;
}

export async function onUseEffect(
  schema: any,
  groupBy: any,
  overview: any,
  setItinerary: any
) {
  try {
    const stub = {
      undefined: [{ HOST_DATE: "repo1" }, { HOST_DATE: "repo2" }],
    };

    console.log(stub);

    setItinerary(stub);

    // const groupByLabel = getGroupByLabel(schema, groupBy);
    // const itinerary = await buildItinerary(overview, groupByLabel);
    // setItinerary(itinerary);
  } catch (e) {
    console.log(e);

    setItinerary([]);
  }
}

export default function OverviewItinerary({
  schema,
  groupBy,
  overview,
  onEntrySelect,
  onEntryCreate,
  onBatchSelect,
}: IOverviewItineraryProps) {
  const [itinerary, setItinerary] = useState([]);

  useEffect(() => {
    onUseEffect(schema, groupBy, overview, setItinerary);
  }, []);

  return (
    <div className={styles.timeline}>
      {!itinerary.length ? (
        <EntryCreateButton {...{ onEntryCreate }} date="" index="1" />
      ) : (
        <VirtualScroll
          {...{ itinerary, onEntrySelect, onEntryCreate, onBatchSelect }}
          rowComponent={ItineraryWaypoint}
        />
      )}
    </div>
  );
}
