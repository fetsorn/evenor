import { useContext, For } from "solid-js";
import { StoreContext, onSort } from "@/store/index.js";
import styles from "./menu_sort_query.module.css";

export function MenuSortQuery(props) {
  const { store } = useContext(StoreContext);

  return (
    <div id="menuSort" className={styles.dropdown}>
      <label id="labelSort" for="selectSort">
        sort:
      </label>

      <select
        id="selectSort"
        className={styles.select}
        value={new URLSearchParams(store.searchParams).get(".sortBy")}
        onChange={({ target: { value } }) => onSort(".sortBy", value)}
      >
        <For
          each={Object.keys(store.schema)
            .filter((branch) =>
              store.schema[branch].trunks.includes(
                new URLSearchParams(store.searchParams).get("_"),
              ),
            )
            .concat([new URLSearchParams(store.searchParams).get("_")])}
        >
          {(field) => <option value={field}>{field}</option>}
        </For>
      </select>

      <Show
        when={
          new URLSearchParams(store.searchParams).get(".sortDirection") ===
          "last"
        }
        fallback={
          <button
            id="sortDirectionFirst"
            onClick={() => onSort(".sortDirection", "last")}
          >
            ▲
          </button>
        }
      >
        <button
          id="sortDirectionLast"
          onClick={() => onSort(".sortDirection", "first")}
        >
          ▼
        </button>
      </Show>
    </div>
  );
}
