import { OverviewRecord } from "../index.js";

export function OverviewItem(props) {
  return (
    <OverviewRecord
      index={props.index}
      baseRecord={props.item}
      record={props.item}
    />
  );
}
