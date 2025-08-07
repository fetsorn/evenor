import { useContext, For } from "solid-js";
import { onSearch } from "@/store/index.js";
import { StoreContext } from "@/store/index.js";

export function MenuBaseQuery(props) {
  const { store } = useContext(StoreContext);

  return (
    <select
      id="selectBase"
      value={new URLSearchParams(store.searchParams).get("_")}
      onChange={({ target: { value } }) => onSearch("_", value)}
    >
      <For each={Object.keys(store.schema)}>
        {(field) => <option value={field}>{field}</option>}
      </For>
    </select>
  );
}
