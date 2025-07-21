import { useContext } from "solid-js";
import {
  StoreContext,
  onRecordEdit,
  onRecordWipe,
  onMindChange,
  onZip,
} from "@/store/index.js";
import { Confirmation, Spoiler } from "@/layout/components/index.js";
import { OverviewRecord } from "../index.js";

export function OverviewItem(props) {
  const { store } = useContext(StoreContext);

  const isHomeScreen = store.mind.mind === "root";

  const isMind = store.searchParams.get("_") === "mind";

  const canOpenMind = isHomeScreen && isMind;

  return (
    <>
      <Show when={canOpenMind} fallback={<></>}>
        <span className={"name"}>{props.item.name} </span>
      </Show>

      <OverviewRecord
        index={props.index}
        record={props.item}
        isOpenDefault={true}
      />

      <button
        className={"edit"}
        onClick={() =>
          onRecordEdit(["record"], JSON.parse(JSON.stringify(props.item)))
        }
      >
        edit{" "}
      </button>

      <Confirmation
        action={`delete`}
        question={"really delete?"}
        onAction={() => onRecordWipe(props.item)}
      />

      <Show when={canOpenMind} fallback={<></>}>
        <button title="zip" onClick={() => onZip(props.item.mind)}>
          Zip{" "}
        </button>
      </Show>

      <Show when={canOpenMind} fallback={<></>}>
        <Spoiler index={props.index + "open"} title={"open"}>
          <For each={props.item["branch"]} fallback={<span>no items</span>}>
            {(item, index) => (
              <button
                className={"open"}
                onClick={() =>
                  onMindChange(`/${props.item.mind}`, `_=${item["branch"]}`)
                }
              >
                {item["branch"]}{" "}
              </button>
            )}
          </For>
        </Spoiler>
      </Show>
    </>
  );
}
