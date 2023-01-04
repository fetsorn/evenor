import React from "react";

interface IWaypointEntriesProps {
  events?: any;
  onEntrySelect?: any;
}

export default function WaypointEntries({
  events,
  onEntrySelect,
}: IWaypointEntriesProps) {
  return (
    <div className={styles.content}>
      <div className={styles.stars}>
        {events.map((event: any, index: number) => (
          <EntrySelectButton {...{ event, index, onEntrySelect }} />
        ))}
      </div>
    </div>
  );
}
