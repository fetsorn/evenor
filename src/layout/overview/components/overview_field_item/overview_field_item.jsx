import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { OverviewRecord, OverviewValue } from "../index.js";

export function OverviewFieldItem(props) {
  const { store } = useContext(StoreContext);

  // if base has no leaves, show value
  // otherwise show record
  const baseIsTwig = () => {
    if (store.schema === undefined || store.schema[props.branch] === undefined)
      return true;

    return store.schema[props.branch].leaves.length === 0;
  };

  return (
    <Switch
      fallback={
        <OverviewRecord
          index={`${props.index}-${props.item[props.item._]}`}
          record={props.item}
        />
      }
    >
      <Match when={baseIsTwig()}>
        <OverviewValue branch={props.branch} value={props.item} />
      </Match>
    </Switch>
  );
}
