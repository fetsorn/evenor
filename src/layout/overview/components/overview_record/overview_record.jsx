import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { OverviewField, OverviewValue } from "../index.js";

export function OverviewRecord(props) {
  const { store } = useContext(StoreContext);

  const { _: branch } = props.record;

  function recordHasLeaf(leaf) {
    return Object.hasOwn(props.record, leaf);
  }

  return (
    <span>
      <OverviewValue value={props.record[props.record._]} />

      <span> </span>

      <For
        each={store.schema[branch].leaves.filter(recordHasLeaf)}
        fallback={<span>record no items</span>}
      >
        {(leaf, index) => {
          const value = props.record[leaf];

          const items = Array.isArray(value) ? value : [value];

          return (
            <OverviewField
              index={`${props.index}-${leaf}`}
              baseRecord={props.baseRecord}
              items={items}
              branch={leaf}
            />
          );
        }}
      </For>
    </span>
  );
}
