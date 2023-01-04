import cn from "classnames";

import styles from "./Row.module.css";

interface IItineraryWaypointProps {
  data?: any;
  onEntrySelect?: any;
  onEntryCreate?: any;
  isLast?: any;
}

export default function ItineraryWaypoint({
  data,
  onEntrySelect,
  onEntryCreate,
  isLast,
  ...others
}: IItineraryWaypointProps) {
  return (
    <section className={cn(styles.row, { [styles.last]: isLast })} {...others}>
      <WaypointTitle title={data.date} />

      <WaypointEntryCreateButton {...{ onEntryCreate }} />

      <WaypointEntries
        {...{ onEntryCreate, onEntrySelect }}
        date={data.date}
        events={data.events}
      />
    </section>
  );
}
