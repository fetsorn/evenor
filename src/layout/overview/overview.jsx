import { createVirtualizer } from "@tanstack/solid-virtual";
import { getSortedRecords } from "@/store/index.js";
import { OverviewItem } from "./components/index.js";
import styles from "./overview.module.css";

export function Overview(props) {
  let parentRef;

  const records = () => getSortedRecords();

  const virtualizer = createVirtualizer({
    get count() {
      return records().length;
    },
    getScrollElement: () => parentRef,
    estimateSize: () => 35,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className={styles.overview}>
      <h1>Entries</h1>

      <div
        className={styles.foo}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        <For each={virtualItems} fallback={<span>list no items</span>}>
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

                  virtualizer.measureElement(node);
                }}
              >
                <OverviewItem
                  index={virtualRow.key}
                  item={records()[virtualRow.index]}
                />
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
