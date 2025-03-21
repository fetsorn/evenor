import { OverviewFieldItem } from "../index.js";

export function OverviewField(props) {
  return (
    <span>
      <For each={leaves} fallback={<span>no items</span>}>
        {(item, index) => {
          return (
            <OverviewFieldItem
              {...{
                baseRecord: props.baseRecord,
                item,
              }}
            />
          );
        }}
      </For>
    </span>
  );
}
