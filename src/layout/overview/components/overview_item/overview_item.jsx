import { useContext } from "solid-js";
import { StoreContext, getBase } from "@/store/index.js";
import { OverviewItemLight, OverviewItemFull } from "../index.js";
import styles from "./overview_item.module.css";

export function OverviewItem(props) {
  const { store } = useContext(StoreContext);

  const base = getBase();

  const grain = { _: base, [base]: props.item };

  return (
    <div id={props.item} className={styles.item}>
      <Show
        when={store.recordMap[props.item]}
        fallback={<OverviewItemLight index={props.index} item={grain} />}
      >
        <OverviewItemFull
          index={props.index}
          item={store.recordMap[props.item]}
        />
      </Show>
    </div>
  );
}
