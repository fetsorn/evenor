import { useContext } from "solid-js";
import cn from "classnames";
import { StoreContext, onSearch } from "@/store/index.js";

export function MenuSortDirection(props) {
  const { store } = useContext(StoreContext);

  return (
    <Show
      when={
        new URLSearchParams(store.searchParams).get(".sortDirection") === "last"
      }
      fallback={
        <button className={cn(props.className)} onClick={() => onSearch(".sortDirection", "last")}>
          sort first
        </button>
      }
    >
      <button className={cn(props.className)} onClick={() => onSearch(".sortDirection", "first")}>
        sort last
      </button>
    </Show>
  );
}
