import { getFilterQueries, getFilterOptions } from "@/store/index.js";
import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { Spoiler } from "@/layout/components/index.js";
import {
  FilterCount,
  FilterDirection,
  FilterOption,
  FilterQuery,
  FilterScroll,
  FilterLoader,
} from "@/layout/filter/components/index.js";
import styles from "./filter.module.css";

export function Filter() {
  const { store } = useContext(StoreContext);

  // use Index here to retain focus on textarea when editing
  // because For considers an item deleted on every input and rerenders
  // and Index only rerenders when an index is deleted or added
  return (
    <span className={styles.filter}>
      <Index
        each={(() => {
          const searchParams = store.searchParams;

          const mind = store.mind;

          return Array.from(
            new URLSearchParams(store.searchParams)
              .entries()
              .filter(([key]) => key !== ".sortDirection"),
          );
        })()}
      >
        {(item, index) => {
          // call because item of Index is a signal
          const [field, value] = item();

          return <FilterQuery field={field} value={value} />;
        }}
      </Index>

      <FilterDirection />

      <Spoiler title={"search"}>
        <For each={getFilterOptions()} fallback={<></>}>
          {(field, index) => <FilterOption field={field} />}
        </For>
      </Spoiler>

      <FilterCount />

      <FilterScroll />

      <FilterLoader />
    </span>
  );
}
