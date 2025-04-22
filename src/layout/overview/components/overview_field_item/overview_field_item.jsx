import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { OverviewRecord, OverviewValue, OverviewRemote } from "../index.js";

export function OverviewFieldItem(props) {
  const { store } = useContext(StoreContext);

  const baseIsTwig = store.schema[props.branch].leaves.length === 0;

  const task = store.schema[props.branch].task;

  const isFile = task === "file";

  const isHomeScreen = store.repo.repo === "root";

  const isRemote = isHomeScreen && task === "remote";

  const isMerge = isHomeScreen && task === "sync";

  return (
    <Switch
      fallback={
        <OverviewRecord
          index={`${props.index}-${props.item[props.item._]}`}
          baseRecord={props.baseRecord}
          record={props.item}
        />
      }
    >
      <Match when={baseIsTwig}>
        <OverviewValue branch={props.branch} value={props.item} />
      </Match>
      <Match when={isFile}>
        <AssetView record={props.item} />;
      </Match>
      <Match when={isRemote}>
        <OverviewRemote
          baseRecord={props.baseRecord}
          branchRecord={props.item}
        />
      </Match>
      <Match when={isMerge}>
        <OverviewMerge
          baseRecord={props.baseRecord}
          branchRecord={props.item}
        />
      </Match>
    </Switch>
  );
}
