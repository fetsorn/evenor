import React from "react";
import styles from "./waypoint_entries.module.css";
import { EntrySelectButton } from "..";

interface IWaypointEntriesProps {
  entries?: any;
  onEntrySelect?: any;
}

export default function WaypointEntries({
  entries,
  onEntrySelect,
}: IWaypointEntriesProps) {
  return (
    <div className={styles.content}>
      <div className={styles.stars}>
        {entries.map((entry: any, index: number) => (
          <div key={index}>
            <EntrySelectButton {...{ entry, index, onEntrySelect }} />
          </div>
        ))}
      </div>
    </div>
  );
}
