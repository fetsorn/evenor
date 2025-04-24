import { useContext } from "solid-js";
import { StoreContext, onSearch } from "@/store/index.js";

export function FilterDirection() {
  const { store } = useContext(StoreContext);

  const isLast = () => {
    return (
      store.searchParams !== undefined &&
      store.searchParams.get(".sortDirection") === "last"
    );
  };

  return (
    <Show
      when={isLast()}
      fallback={
        <a onClick={() => onSearch(".sortDirection", "last")}>sort first</a>
      }
    >
      <a onClick={() => onSearch(".sortDirection", "first")}>sort last</a>
    </Show>
  );
}
