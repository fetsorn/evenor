import React from "react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import styles from "./itinerary_waypoint.module.css";
import { WaypointEntries } from "..";

// TODO: replace with Day.js
function isDate(title) {
  return true;
}

// TODO: replace with Day.js
function formatDate(title) {
  return title;
}

export function ItineraryWaypoint({
  data: waypoint,
  onRecordSelect,
  onRecordCreate,
  isLast,
  ...others
}) {
  const { t } = useTranslation();

  return (
    <section className={cn(styles.row, { [styles.last]: isLast })} {...others}>
      <div>
        {isDate(waypoint.date) ? ( // try to parse as date, otherwise render as is
          <time className={styles.date} dateTime={waypoint.date.slice(1, -1)}>
            {formatDate(waypoint.date)}
          </time>
        ) : (
          <div className={styles.date}>{waypoint.date}</div>
        )}

        <button
          className={styles.add}
          type="button"
          onClick={() =>
            onRecordCreate(waypoint.date, waypoint.events.length + 1)
          }
          title={t("line.button.add")}
          key="addevent"
        >
          +
        </button>
      </div>

      <WaypointEntries {...{ onRecordSelect }} entries={waypoint.events} />
    </section>
  );
}
