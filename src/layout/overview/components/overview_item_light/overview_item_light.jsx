import { createElementSize } from "@solid-primitives/resize-observer";
import { useContext, createSignal, createEffect } from "solid-js";
import {
  StoreContext,
  onRecordEdit,
  onRecordWipe,
  onMindChange,
  onMindOpen,
  onExport,
  getRecord,
} from "@/store/index.js";
import { Confirmation, Spoiler } from "@/layout/components/index.js";
import { OverviewValue } from "../index.js";
import styles from "./overview_item_light.module.css";

export function OverviewItemLight(props) {
  const { store } = useContext(StoreContext);

  const [content, setContent] = createSignal();

  const [showActions, setShowActions] = createSignal(false);

  const [isFull, setIsFull] = createSignal(false);

  return (
    <div id={props.item[props.item._]} className={styles.item}>
      <div className={styles.fold}>
        <div className={styles.content} ref={setContent}>
          <OverviewValue
            branch={props.item._}
            value={props.item[props.item._]}
          />
        </div>
      </div>

      <button
        onClick={async () => {
          await getRecord(props.item);
        }}
      >
        more...
      </button>
    </div>
  );
}
