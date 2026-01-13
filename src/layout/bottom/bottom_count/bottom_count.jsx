import { useContext } from "solid-js";
import { StoreContext, onSearch } from "@/store/index.js";

export function BottomCount() {
  const { store } = useContext(StoreContext);

  return <span>found {store.recordSet.length} </span>;
}
