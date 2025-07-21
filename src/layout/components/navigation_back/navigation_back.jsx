import { useContext } from "solid-js";
import { StoreContext, onMindChange } from "@/store/index.js";

export function NavigationBack() {
  const { store } = useContext(StoreContext);

  return (
    <Show when={store.mind.mind !== "root"} fallback={<span></span>}>
      <button
        className="navigationBack"
        onClick={() => onMindChange("/", "_=mind")}
      >
        back
      </button>
    </Show>
  );
}
