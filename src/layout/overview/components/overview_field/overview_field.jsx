import { OverviewFieldItem } from "../index.js";

export function OverviewField(props) {
  return (
    <For each={props.items} fallback={<span>field no items</span>}>
      {(item, index) => {
        return (
          <OverviewFieldItem
            index={`${props.index}-${index}`}
            item={item}
            branch={props.branch}
          />
        );
      }}
    </For>
  );
}
