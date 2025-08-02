import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";

export function NavigationLoader() {
  const { store } = useContext(StoreContext);

  return (
    <Show when={store.loading} fallback={<></>}>
      <span>Loading...</span>
    </Show>
  );
}
