import { useContext } from "solid-js";
import { StoreContext, onRecordPick } from "@/store.js";

export function ViewBar() {
  const { store } = useContext(StoreContext);

  return (
    <div>
      <button
        type="button"
        title={""}
        onClick={() => onRecordPick(undefined)}
      ></button>
      <span>{store.record}</span>
      <button type="button" title={""} onClick={() => {}}></button>
    </div>
  );
}
