import { useContext } from "solid-js";
import { StoreContext, isTwig } from "@/store/index.js";
import { OverviewRecord, OverviewValue } from "../index.js";

export function OverviewFieldItem(props) {
  const { store } = useContext(StoreContext);

  const baseIsTwig = isTwig(store.schema, props.branch);

  if (baseIsTwig) {
    return <OverviewValue value={props.item} />;
  }

  return (
    <OverviewRecord
      index={`${props.index}-${props.item[props.item._]}`}
      baseRecord={props.baseRecord}
      record={props.item}
    />
  );
}
