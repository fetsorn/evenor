import { useContext, createSignal } from "solid-js";
import { StoreContext, onRecordSave } from "@/store/index.js";

export function NavigationSave() {
  const { store } = useContext(StoreContext);

  const [recordBackup] = createSignal(store.record);

  return (
    <button
      className="navigationSave"
      title={""}
      onClick={() => onRecordSave(recordBackup(), store.record)}
    >
      save
    </button>
  );
}
