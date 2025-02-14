import { useContext } from "solid-js";
import { StoreContext } from "@/store.js";

export function EditBar() {
  const { store } = useContext(StoreContext);

  return (
    <div>
      <button type="button" title={""} onClick={() => {}}></button>
      <span>{store.record}</span>
      <button type="button" title={""} onClick={() => {}}></button>
    </div>
  );
}
