import { useContext, For } from "solid-js";
import { onSearch } from "@/store/index.js";
import { StoreContext } from "@/store/index.js";

export function MenuSortQuery(props) {
  const { store } = useContext(StoreContext);

  return (
    <select
      id="selectSort"
      value={new URLSearchParams(store.searchParams).get(".sortBy")}
      onChange={({ target: { value } }) => onSearch(".sortBy", value)}
    >
      <For each={Object.keys(store.schema).filter((branch) => store.schema[branch].trunks.includes(new URLSearchParams(store.searchParams).get("_"))).concat([new URLSearchParams(store.searchParams).get("_")])}>
        {(field) => <option value={field}>{field}</option>}
      </For>
    </select>
  );
}
