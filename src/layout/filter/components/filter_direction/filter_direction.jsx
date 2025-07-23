import { useContext } from "solid-js";
import { StoreContext, onSearch } from "@/store/index.js";

export function FilterDirection() {
  const { store } = useContext(StoreContext);

  return (
    <Show
      when={store.searchParams.get(".sortDirection") === "last"}
      fallback={
        <button onClick={() => onSearch(".sortDirection", "last")}>
          sort first
        </button>
      }
    >
      <button onClick={() => onSearch(".sortDirection", "first")}>
        sort last
      </button>
    </Show>
  );
}
