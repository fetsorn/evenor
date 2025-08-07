import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";

export function OverviewHeader() {
  const { store } = useContext(StoreContext);

  function capitalize(str) {return str[0].toUpperCase() + str.slice(1)};

  return (
    <h1>{capitalize(store.mind.name) ?? "Entries"}</h1>
  )
}
