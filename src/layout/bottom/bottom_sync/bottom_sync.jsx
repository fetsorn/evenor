import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";

export function BottomSync() {
  const { store } = useContext(StoreContext);

  return (
    <Show when={!store.mergeResult} fallback={<></>}>
      <span>Conflict</span>
    </Show>
  );
}
