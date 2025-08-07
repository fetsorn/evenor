import { useContext } from "solid-js";
import { StoreContext, onRecordCreate } from "@/store/index.js";

export function BottomNew() {
  const { store } = useContext(StoreContext);

  // if base is twig, it has no connections
  // we can add new values to csvs only if base has some connections
  const canAdd = () => {
    // store is set to undefined for a short moment to overwrite data
    if (store.schema === undefined || store.searchParams === undefined)
      return false;

    return (
      store.schema[new URLSearchParams(store.searchParams).get("_")] &&
      store.schema[new URLSearchParams(store.searchParams).get("_")].leaves
        .length > 0
    );
  };
  return (
    <Show when={canAdd()} fallback={<></>}>
      <button className="bottomNew" onClick={() => onRecordCreate()}>
        new
      </button>
    </Show>
  );
}
