import { createVirtualizer } from "@tanstack/solid-virtual";
import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { getSortedRecords } from "@/store/index.js";
import { OverviewItem } from "./components/index.js";
import styles from "./overview.module.css";

export function Overview(props) {
  const { store } = useContext(StoreContext);

  let parentRef;

  const virtualizer = () =>
    createVirtualizer({
      get count() {
        // here just to trigger recount on sort change
        const searchParams = store.searchParams;

        return store.records.length;
      },
      getScrollElement: () => parentRef,
      estimateSize: () => 35,
      overscan: 5,
    });

  return (
    <div ref={parentRef} className={styles.overview}>
      <h1>Entries</h1>

      <div
        className={styles.foo}
        style={{
          height: `${virtualizer().getTotalSize()}px`,
        }}
      >
        <For
          each={(() => {
            // here just to trigger render on sort change
            const searchParams = store.searchParams;

            return virtualizer().getVirtualItems();
          })()}
          fallback={
            <span>press "new" in the top right corner to add entries</span>
          }
        >
          {(virtualRow) => (
            <div
              className={styles.bar}
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={(node) => {
                  // https://github.com/TanStack/virtual/issues/930
                  node.dataset.index = virtualRow.index.toString();

                  virtualizer().measureElement(node);
                }}
              >
                <OverviewItem
                  index={virtualRow.key}
                  item={getSortedRecords(virtualRow.index)}
                />
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
