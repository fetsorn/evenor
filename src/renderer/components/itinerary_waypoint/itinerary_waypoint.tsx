import cn from "classnames";

import styles from "./itinerary_waypoint.module.css";

import { WaypointTitle, EntryCreateButton, WaypointEntries } from "..";

interface IItineraryWaypointProps {
  waypoint?: any;
  onEntrySelect?: any;
  onEntryCreate?: any;
  isLast?: any;
}

export default function ItineraryWaypoint({
  waypoint,
  onEntrySelect,
  onEntryCreate,
  isLast,
  ...others
}: IItineraryWaypointProps) {
  return (
    <section className={cn(styles.row, { [styles.last]: isLast })} {...others}>
      <WaypointTitle title={waypoint.date} />

      <EntryCreateButton
        {...{ onEntryCreate }}
        date={waypoint.date}
        index={waypoint.events.length + 1}
      />

      <WaypointEntries {...{ onEntrySelect }} entries={waypoint.events} />
    </section>
  );
}
