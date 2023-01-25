import cn from "classnames";
import { useTranslation } from "react-i18next";
import styles from "./itinerary_waypoint.module.css";
import { WaypointTitle, WaypointEntries } from "..";

interface IItineraryWaypointProps {
  data: any;
  onEntrySelect: any;
  onEntryCreate: any;
  isLast?: any;
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
        <WaypointTitle title={waypoint.date} />

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
