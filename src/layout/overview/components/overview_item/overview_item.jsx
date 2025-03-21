import { onRecordEdit } from "@/store/index.js";
import { OverviewRecord } from "../index.js";

export function OverviewItem(props) {
  return (
    <span>
      {props.item}

      <a onClick={() => onRecordEdit(props.item)}>edit</a>

      <OverviewRecord {...{ baseRecord: props.item, record: props.item }} />
    </span>
  );
}
