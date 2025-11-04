import { useContext, For } from "solid-js";
import { onBase } from "@/store/index.js";
import { StoreContext } from "@/store/index.js";
import styles from "./menu_base_query.module.css";

export function MenuBaseQuery(props) {
  const { store } = useContext(StoreContext);

  return (
    <div id="menuBase" className={styles.dropdown}>
      <label id="labelBase" for="selectBase">
        base:
      </label>

      <select
        id="selectBase"
        className={styles.select}
        value={new URLSearchParams(store.searchParams).get("_")}
        onChange={({ target: { value } }) => onBase(value)}
      >
        <For each={Object.keys(store.schema)}>
          {(field) => <option value={field}>{field}</option>}
        </For>
      </select>
    </div>
  );
}
