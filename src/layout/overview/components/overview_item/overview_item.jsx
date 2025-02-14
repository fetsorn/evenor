import { onRecordPick } from "@/store.js";

export function OverviewItem(props) {
  return <div onClick={() => onRecordPick(props.item)}>{props.item}</div>;
}
