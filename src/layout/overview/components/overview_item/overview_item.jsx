import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { OverviewItemLight, OverviewItemFull } from "../index.js";
import styles from "./overview_item.module.css";

export function OverviewItem(props) {
  const { store } = useContext(StoreContext);

  return (
    <div id={props.item[props.item._]} className={styles.item}>
      <Show
        when={store.recordMap[props.item[props.item._]]}
        fallback={<OverviewItemLight index={props.index} item={props.item} />}
      >
        <OverviewItemFull
          index={props.index}
          item={store.recordMap[props.item[props.item._]]}
        />
      </Show>
    </div>
  );
}
