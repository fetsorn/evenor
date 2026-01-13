import { useContext } from "solid-js";
import { StoreContext, onCancel } from "@/store/index.js";
import { Confirmation } from "@/layout/components/index.js";

export function BottomLoader() {
  const { store } = useContext(StoreContext);

  return (
    <Show when={store.loading} fallback={<></>}>
      <span>Loading...</span>

      <Confirmation
        action={`cancel`}
        question={"really cancel?"}
        onAction={() => onCancel()}
      />
    </Show>
  );
}
