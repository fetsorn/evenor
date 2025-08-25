import { createElementSize } from "@solid-primitives/resize-observer";
import { useContext, createSignal, createEffect } from "solid-js";
import {
  StoreContext,
  onRecordEdit,
  onRecordWipe,
  onMindChange,
  getDefaultBase,
  onZip,
} from "@/store/index.js";
import { Confirmation, Spoiler } from "@/layout/components/index.js";
import { OverviewRecord } from "../index.js";
import styles from "./overview_item.module.css";

export function OverviewItem(props) {
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
    <div className={styles.item}>
      <div
        className={isFold() ? styles.fold : styles.unfold}
      >
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
              onRecordEdit(["record"], JSON.parse(JSON.stringify(props.item)))

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
            <button title="zip" onClick={() => onZip(props.item.mind)}>
              Zip{" "}
            </button>
          </Show>

          <Show when={canOpenMind} fallback={<></>}>
            <button
              title="open"
              onClick={async () => {
                const base = await getDefaultBase(props.item.mind);

                await onMindChange(`/${props.item.mind}`, `_=${base}`);
              }}
            >
              Open{" "}
            </button>
          </Show>
        </>
      </Show>
    </div>
  );
}
