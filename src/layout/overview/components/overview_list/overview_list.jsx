import { createVirtualizer } from "@tanstack/solid-virtual";
import { OverviewItem } from "..";
import styles from "./overview_list.module.css";

export function OverviewList(props) {
  let parentRef;

  const virtualizer = createVirtualizer({
    // TODO: remove get and reflect
    get count() {
      return Reflect.get(props.items ?? [], "length");
    },
    getScrollElement: () => parentRef,
    estimateSize: () => 35,
    overscan: 5,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className={styles.overview}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        <For each={items} fallback={<span>list no items</span>}>
          {(virtualRow) => (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
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
                  item={props.items[virtualRow.index]}
                />
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
