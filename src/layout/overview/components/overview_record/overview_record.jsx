import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { OverviewField } from "../index.js";

export function OverviewRecord(props) {
  const { store } = useContext(StoreContext);

  const { _: base } = store.queries;

  const { leaves } = store.schema[base];

  return (
    <span>
      <For each={leaves} fallback={<span>no items</span>}>
        {(leaf, index) => {
          const items = props.record[leaf];

          return (
            <OverviewField
              {...{
                baseRecord: props.baseRecord,
                items,
              }}
            />
          );
        }}
      </For>
    </span>
  );
}
