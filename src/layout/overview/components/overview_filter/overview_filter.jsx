import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";

export function OverviewFilter() {
  const { store } = useContext(StoreContext);

  return (
    <span>
      <For each={Object.entries(store.queries)}>
        {([key, value], index) => (
          <span>
            {key}: <span contenteditable={true}>{value}</span> <span> </span>
          </span>
        )}
      </For>
    </span>
  );
}
