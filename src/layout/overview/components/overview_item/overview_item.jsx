import { createSignal, useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { onRecordEdit, onRecordWipe, onRepoChange } from "@/store/index.js";
import { OverviewRecord } from "../index.js";
import { Spoiler } from "@/layout/components/index.js";
import api from "@/api/index.js";

export function OverviewItem(props) {
  const { store } = useContext(StoreContext);

  const [confirmation, setConfirmation] = createSignal(false);

  const isHomeScreen = store.repo.repo === "root";

  const isRepo = store.queries._ === "repo";

  const canOpenRepo = isHomeScreen && isRepo;

  const onZip = async () => {
    await api.zip(props.item.repo);
  };

  return (
    <span>
      <Show when={canOpenRepo} fallback={<></>}>
        <span>{props.item.reponame}</span>
      </Show>

      <span> </span>

      <a onClick={() => onRecordEdit(props.item)}>edit</a>

      <span> </span>

      <Show
        when={confirmation()}
        fallback={<a onClick={() => setConfirmation(true)}>delete</a>}
      >
        <span>
          really remove?
          <a onClick={() => onRecordWipe(props.item)}>Yes</a>
          <a onClick={() => setConfirmation(false)}>No</a>
        </span>
      </Show>

      <span> </span>

      <Show when={canOpenRepo} fallback={<></>}>
        <Spoiler index={`${props.index}-open`} title="open">
          <For each={props.item["branch"]} fallback={<span>no items</span>}>
            {(item, index) => {
              const branch = item["branch"];

              return (
                <a onClick={() => onRepoChange(props.item.repo, branch)}>
                  {branch}
                  <span> </span>
                </a>
              );
            }}
          </For>
        </Spoiler>
      </Show>

      <span> </span>

      <Show when={canOpenRepo} fallback={<></>}>
        <a title="zip" onClick={() => onZip()}>
          Zip
        </a>
      </Show>

      <span> </span>

      <Spoiler index={props.index} title={props.item._} isOpenDefault={true}>
        <OverviewRecord
          index={props.index}
          baseRecord={props.item}
          record={props.item}
        />
      </Spoiler>
    </span>
  );
}
