import { useContext } from "solid-js";
import { StoreContext } from "@/store.js";

export function OverviewItem(props) {
  const { setStore } = useContext(StoreContext);

  return <div onClick={() => setStore("record", props.item)}>{props.item}</div>;
}
