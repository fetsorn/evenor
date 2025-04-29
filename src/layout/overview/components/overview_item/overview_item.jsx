import { useContext } from "solid-js";
import {
  StoreContext,
  onRecordEdit,
  onRecordWipe,
  onRepoChange,
  onZip,
} from "@/store/index.js";
import { Confirmation, Spoiler } from "@/layout/components/index.js";
import { OverviewRecord } from "../index.js";

export function OverviewItem(props) {
  const { store } = useContext(StoreContext);

  const isHomeScreen = store.repo.repo === "root";

  const isRepo = store.searchParams.get("_") === "repo";

  const canOpenRepo = isHomeScreen && isRepo;

  return (
    <>
      <Show when={canOpenRepo} fallback={<></>}>
        <span className={"reponame"}>{props.item.reponame} </span>
      </Show>

      <OverviewRecord index={props.index} record={props.item} />

      <button
        className={"edit"}
        onClick={() => onRecordEdit(["record"], props.item)}
      >
        edit{" "}
      </button>

      <Confirmation
        action={`delete`}
        question={"really delete?"}
        onAction={() => onRecordWipe(props.item)}
      />

      <Show when={canOpenRepo} fallback={<></>}>
        <button title="zip" onClick={() => onZip(props.item.repo)}>
          Zip{" "}
        </button>
      </Show>

      <Show when={canOpenRepo} fallback={<></>}>
        <Spoiler index={props.index + "open"} title={"open"}>
          <For each={props.item["branch"]} fallback={<span>no items</span>}>
            {(item, index) => (
              <button
                className={"open"}
                onClick={() =>
                  onRepoChange(`/${props.item.repo}`, `_=${item["branch"]}`)
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
