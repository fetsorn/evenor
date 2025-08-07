import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { getSortedRecords } from "@/store/index.js";
import { OverviewItem } from "./components/index.js";
import styles from "./overview.module.css";

export function Overview() {
  const { store } = useContext(StoreContext);

  let parentRef;

  function capitalize(str) {return str[0].toUpperCase() + str.slice(1)};

  return (
    <div ref={parentRef} className={styles.overview}>
      <h1>{capitalize(store.mind.name) ?? "Entries"}</h1>

      <div className={styles.foo}>
        <For
          each={store.records}
          fallback={
            <span>press "new" in the top right corner to add entries</span>
          }
        >
          {(item, index) => (
            <div className={styles.bar}>
              <OverviewItem index={`overview_item_${index}`} item={item} />
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
