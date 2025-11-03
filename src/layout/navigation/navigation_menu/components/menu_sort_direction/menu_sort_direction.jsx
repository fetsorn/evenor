import { useContext } from "solid-js";
import { StoreContext, onSort } from "@/store/index.js";

export function MenuSortDirection(props) {
  const { store } = useContext(StoreContext);

  return (
    <Show
      when={
        new URLSearchParams(store.searchParams).get(".sortDirection") === "last"
      }
      fallback={
        <button
          id="sortDirectionFirst"
          className={props.className}
          onClick={() => onSort(".sortDirection", "last")}
        >
          sort first
        </button>
      }
    >
      <button
        id="sortDirectionLast"
        className={props.className}
        onClick={() => onSort(".sortDirection", "first")}
      >
        sort last
      </button>
    </Show>
  );
}
