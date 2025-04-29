import { Spoiler } from "@/layout/components/index.js";
import { OverviewFieldItem } from "../index.js";

export function OverviewField(props) {
  const items = () =>
    Array.isArray(props.items) ? props.items : [props.items];

  return (
    <>
      <Show when={items()[0]}>
        <OverviewFieldItem
          index={`${props.index}-0`}
          item={items()[0]}
          branch={props.branch}
        />
      </Show>

      <Show when={items().length > 1}>
        <Spoiler index={`${props.index}spoiler`} title={"and"}>
          <For each={items().slice(1)} fallback={<></>}>
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
        </Spoiler>
      </Show>
    </>
  );
}
