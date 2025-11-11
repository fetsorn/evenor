import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { getSortedRecords } from "@/store/index.js";
import { OverviewItem, OverviewFilter, OverviewHeader } from "./components/index.js";
import styles from "./overview.module.css";

export function Overview() {
  const { store } = useContext(StoreContext);

  return (
    <>
      <OverviewHeader />

      <OverviewFilter />

      <div className={styles.container}>
        <div className={styles.items}>
        <For
          each={store.records}
          fallback={
            <span>press "new" in the top right corner to add entries</span>
          }
        >
          {(item, index) => (
            <div className={styles.item}>
              <OverviewItem index={`overview_item_${index}`} item={item} />
            </div>
          )}
        </For>
        </div>
      </div>
    </>
  );
}
