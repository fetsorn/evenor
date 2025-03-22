import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { onRepoChange, onRecordEdit } from "@/store/index.js";
import { OverviewFilter, OverviewList } from "./components/index.js";
import styles from "./overview.module.css";

export function Overview() {
  const { store } = useContext(StoreContext);

  // if base is twig, it has no connections
  // we can add new values only if base has connections
  const canAdd = () =>
    store.schema[store.queries._] &&
    store.schema[store.queries._].leaves.length > 0;

  // find first available string value for sorting
  function findFirstSortBy(branch, value) {
    // if array, take first item
    const car = Array.isArray(value) ? value[0] : value;

    // it object, take base field
    const key = typeof car === "object" ? car[branch] : car;

    // if undefined, return empty string
    const id = key === undefined ? "" : key;

    return id;
  }

  const sorted = () =>
    store.records.toSorted((a, b) => {
      const sortBy = store.queries[".sortBy"];

      const valueA = findFirstSortBy(sortBy, a[sortBy]);

      const valueB = findFirstSortBy(sortBy, b[sortBy]);

      return valueA.localeCompare(valueB);
    });

  return (
    <div className={styles.overview}>
      <div className={styles.button_bar}>
        <Show when={store.repo.repo !== "root"} fallback={<span></span>}>
          <a onClick={() => onRepoChange("root")}>back</a>
        </Show>

        <Show when={canAdd()} fallback={<></>}>
          <a onClick={() => onRecordEdit(undefined)}>add</a>
        </Show>
      </div>

      <OverviewFilter />

      <OverviewList items={sorted()} />
    </div>
  );
}
