import { useContext } from "solid-js";
import { StoreContext, onRecordCreate } from "@/store/index.js";

export function NavigationAdd() {
  const { store } = useContext(StoreContext);

  // if base is twig, it has no connections
  // we can add new values to csvs only if base has some connections
  const canAdd = () => {
    // store is set to undefined for a short moment to overwrite data
    if (store.schema === undefined || store.searchParams === undefined)
      return false;

    return (
      store.schema[store.searchParams.get("_")] &&
      store.schema[store.searchParams.get("_")].leaves.length > 0
    );
  };
  return (
    <Show when={canAdd()} fallback={<></>}>
      <a onClick={() => onRecordCreate()}>add</a>
    </Show>
  );
}
