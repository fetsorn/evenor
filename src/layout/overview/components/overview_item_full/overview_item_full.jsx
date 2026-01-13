import { createElementSize } from "@solid-primitives/resize-observer";
import { useContext, createSignal, createEffect } from "solid-js";
import {
  StoreContext,
  onRecordEdit,
  onRecordWipe,
  onMindChange,
  onMindOpen,
  onExport,
} from "@/store/index.js";
import { Confirmation, Spoiler } from "@/layout/components/index.js";
import { OverviewRecord } from "../index.js";
import styles from "./overview_item_full.module.css";

export function OverviewItemFull(props) {
  const { store } = useContext(StoreContext);

  const [content, setContent] = createSignal();

  const size = createElementSize(content);

  const [showActions, setShowActions] = createSignal(false);

  const [isBigItem, setIsBigItem] = createSignal(false);

  const [isFold, setIsFold] = createSignal(true);

  const isHomeScreen = store.mind.mind === "root";

  const isMind = new URLSearchParams(store.searchParams).get("_") === "mind";

  const canOpenMind = isHomeScreen && isMind;

  return (
    <div id={props.item[props.item._]} className={styles.item}>
      <div className={isFold() ? styles.fold : styles.unfold}>
        <div className={styles.content} ref={setContent}>
          <OverviewRecord
            index={props.index}
            record={props.item}
            isOpenDefault={true}
          />
        </div>
      </div>

      <Show when={size.height > 40}>
        <Show
          when={isFold()}
          fallback={<button onClick={() => setIsFold(true)}>less...</button>}
        >
          <button onClick={() => setIsFold(false)}>more...</button>
        </Show>
      </Show>

      <Show
        when={showActions()}
        fallback={<button onClick={() => setShowActions(true)}>.</button>}
      >
        <>
          <button
            className={"edit"}
            onClick={() => {
              console.log(content().innerText);

              onRecordEdit(["record"], JSON.parse(JSON.stringify(props.item)));

              setShowActions(false);
            }}
          >
            edit{" "}
          </button>

          <Confirmation
            action={`delete`}
            question={"really delete?"}
            onAction={() => onRecordWipe(props.item)}
            onCancel={() => setShowActions(false)}
          />

          <Show when={canOpenMind} fallback={<></>}>
            <button title="zip" onClick={() => onExport(props.item.mind)}>
              export{" "}
            </button>
          </Show>

          <Show when={canOpenMind} fallback={<></>}>
            <button title="open" onClick={() => onMindOpen(props.item.mind)}>
              open{" "}
            </button>
          </Show>
        </>
      </Show>
    </div>
  );
}
