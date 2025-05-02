import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { Spoiler } from "@/layout/components/index.js";
import { OverviewField, OverviewValue } from "../index.js";

export function OverviewRecord(props) {
  const { store } = useContext(StoreContext);

  function recordHasLeaf(leaf) {
    return Object.hasOwn(props.record, leaf);
  }

  return (
    <>
      <OverviewValue
        branch={props.record._}
        value={props.record[props.record._]}
      />

      <Spoiler
        index={props.index}
        title={"with"}
        isOpenDefault={props.isOpenDefault}
      >
        <For
          each={
            store.schema !== undefined &&
            props.record !== undefined &&
            store.schema[props.record._] !== undefined &&
            store.schema[props.record._].leaves.filter(recordHasLeaf)
          }
          fallback={<span>record no items</span>}
        >
          {(leaf, index) => {
            const value = props.record[leaf];

            const items = Array.isArray(value) ? value : [value];

            return (
              <OverviewField
                index={`${props.index}-${leaf}`}
                items={items}
                branch={leaf}
              />
            );
          }}
        </For>
      </Spoiler>
    </>
  );
}
