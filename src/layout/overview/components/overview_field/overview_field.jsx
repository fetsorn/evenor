import { OverviewFieldItem } from "../index.js";
import { Spoiler } from "@/layout/components/index.js";

export function OverviewField(props) {
  return (
    <Spoiler index={props.index} title={props.branch}>
      <For each={props.items} fallback={<span>field no items</span>}>
        {(item, index) => {
          return (
            <OverviewFieldItem
              index={`${props.index}-${index}`}
              baseRecord={props.baseRecord}
              item={item}
              branch={props.branch}
            />
          );
        }}
      </For>
    </Spoiler>
  );
}
