import { useContext } from "solid-js";
import { StoreContext, onRepoChange } from "@/store/index.js";

export function NavigationBack() {
  const { store } = useContext(StoreContext);

  return (
    <Show when={store.repo.repo !== "root"} fallback={<span></span>}>
      <a onClick={() => onRepoChange("/", "_=repo")}>back</a>
    </Show>
  );
}
