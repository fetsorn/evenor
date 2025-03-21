import { isTwig } from "@/store/index.js";
import { OverviewRecord, OverviewValue } from "../index.js";

export function OverviewFieldItem(props) {
  const baseIsTwig = isTwig(schema, base);

  if (baseIsTwig) {
    return <OverviewValue value={item} />;
  }

  return <OverviewRecord baseRecord={props.baseRecord} record={props.item} />;
}
