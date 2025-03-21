import { useContext } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { StoreContext } from "@/store/index.js";
import { OverviewItem } from "..";
import styles from "./overview_list.module.css";

export function OverviewList(props) {
  let parentRef;

  const { store } = useContext(StoreContext);

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
              <OverviewItem item={props.items[virtualRow.index]} />
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
