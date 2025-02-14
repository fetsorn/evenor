import styles from "./app.module.css";
import cn from "classnames";
import { createSignal, createContext, For, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { createVirtualizer } from "@tanstack/solid-virtual";

const StoreContext = createContext();

function OverviewFilter() {
  return <div>filter</div>;
}

function OverviewItem(props) {
  const { setStore } = useContext(StoreContext);

  return <div onClick={() => setStore("record", props.item)}>{props.item}</div>;
}

function OverviewList() {
  let parentRef;

  const { store } = useContext(StoreContext);

  const virtualizer = createVirtualizer({
    count: store.records.length,
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
              <OverviewItem item={store.records[virtualRow.index]} />
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
  const { store } = useContext(StoreContext);

  return (
    <div
      className={cn(
        styles.sidebar,
        { [styles.invisible]: !store.record },
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
  const [store, setStore] = createStore({
    record: undefined,
    records: Array.from({ length: 30 }, (_, i) => `Item ${i}`),
  });

  return (
    <StoreContext.Provider value={{ store, setStore }}>
      <div class={styles.App}>
        <Overview />
        <Profile />
      </div>
    </StoreContext.Provider>
  );
}

export default App;
