import cn from "classnames";

import styles from "./itinerary_waypoint.module.css";

import { WaypointTitle, EntryCreateButton, WaypointEntries } from "..";

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
  return (
    <section className={cn(styles.row, { [styles.last]: isLast })} {...others}>
      <div>
        <WaypointTitle title={waypoint.date} />

        <EntryCreateButton
          {...{ onEntryCreate }}
          date={waypoint.date}
          index={waypoint.events.length + 1}
        />
      </div>

      <WaypointEntries {...{ onEntrySelect }} entries={waypoint.events} />
    </section>
  );
}
