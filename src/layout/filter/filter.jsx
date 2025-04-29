import { getFilterQueries, getFilterOptions } from "@/store/index.js";
import { Spoiler } from "@/layout/components/index.js";
import {
  FilterCount,
  FilterDirection,
  FilterOption,
  FilterQuery,
  FilterScroll,
} from "@/layout/filter/components/index.js";
import styles from "./filter.module.css";

export function Filter() {
  // use Index here to retain focus on textarea when editing
  // because For considers an item deleted on every input and rerenders
  // and Index only rerenders when an index is deleted or added
  return (
    <span className={styles.filter}>
      <Index each={getFilterQueries()}>
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
    </span>
  );
}
