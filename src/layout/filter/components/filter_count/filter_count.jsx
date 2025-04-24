import { useContext } from "solid-js";
import { StoreContext, onSearch } from "@/store/index.js";

export function FilterCount() {
  const { store } = useContext(StoreContext);

  return <span>found {store.records.length}</span>;
}
