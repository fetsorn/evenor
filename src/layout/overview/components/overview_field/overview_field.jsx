import { OverviewFieldItem } from "../index.js";

export function OverviewField(props) {
  return (
    <span>
      <For each={props.items} fallback={<span>field no items</span>}>
        {(item, index) => {
          return (
            <OverviewFieldItem
              baseRecord={props.baseRecord}
              item={item}
              branch={props.branch}
            />
          );
        }}
      </For>
    </span>
  );
}
