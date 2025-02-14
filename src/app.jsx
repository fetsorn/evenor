import styles from "./app.module.css";
import cn from "classnames";
import { createSignal, For } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";

function OverviewFilter() {
  return <div>filter</div>;
}

function OverviewItem(props) {
  return <div>{props.item}</div>;
}

function OverviewList() {
  let parentRef;

  const [listItems] = createSignal(
    Array.from({ length: 30 }, (_, i) => `Item ${i}`),
  );

  const virtualizer = createVirtualizer({
    count: listItems().length,
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
        <For each={items} fallback={<div>hui</div>}>
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
              <OverviewItem item={listItems()[virtualRow.index]} />
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

function Overview() {
  return (
    <div>
      <OverviewFilter />
      <OverviewList />
    </div>
  );
}

function Profile() {
  return (
    <div
      className={cn(
        styles.sidebar,
        { [styles.invisible]: false },
        "profile-view__sidebar view__sidebar",
      )}
    >
      <div className={cn(styles.container, "view-sidebar__container")}>
        <div
          id="scrollcontainer"
          className={cn(styles.sticky, "view-sidebar__sticky")}
        >
          profile
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div class={styles.App}>
      <Overview />
      <Profile />
    </div>
  );
}

export default App;
