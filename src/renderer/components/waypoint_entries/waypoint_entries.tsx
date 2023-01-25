import React from "react";
import styles from "./waypoint_entries.module.css";
import { colorExtension } from "..";

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
            <button
              className={styles.star}
              style={{ backgroundColor: colorExtension(entry) }}
              type="button"
              onClick={() => onEntrySelect(entry, index + 1)}
              title={entry?.FILE_PATH}
              id={entry?.UUID}
            >
              {index + 1}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
