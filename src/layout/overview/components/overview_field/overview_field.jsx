import { OverviewFieldItem } from "../index.js";

export function OverviewField(props) {
  return (
    <span>
      <For each={props.items} fallback={<span>no items</span>}>
        {(item, index) => {
          return (
            <OverviewFieldItem baseRecord={props.baseRecord} item={item} />
          );
        }}
      </For>
    </span>
  );
}
