import cn from "classnames";
import { useTranslation } from "react-i18next";
import styles from "./itinerary_waypoint.module.css";
import { WaypointEntries } from "..";

interface IItineraryWaypointProps {
  data: any;
  onEntrySelect: any;
  onEntryCreate: any;
  isLast?: any;
}

// TODO: replace with Day.js
function isDate(title: string): boolean {
  return true;
}

// TODO: replace with Day.js
function formatDate(title: string): string {
  return title;
}

export default function ItineraryWaypoint({
  data: waypoint,
  onEntrySelect,
  onEntryCreate,
  isLast,
  ...others
}: IItineraryWaypointProps) {
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
          onClick={() => onEntryCreate(waypoint.date, waypoint.events.length + 1)}
          title={t("line.button.add")}
          key="addevent"
        >
          +
        </button>
      </div>

      <WaypointEntries {...{ onEntrySelect }} entries={waypoint.events} />
    </section>
  );
}
