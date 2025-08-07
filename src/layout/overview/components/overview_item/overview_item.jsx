import { useContext } from "solid-js";
import {
  StoreContext,
  onRecordEdit,
  onRecordWipe,
  onMindChange,
  getDefaultBase,
  onZip,
} from "@/store/index.js";
import { Confirmation, Spoiler } from "@/layout/components/index.js";
import { OverviewRecord } from "../index.js";

export function OverviewItem(props) {
  const { store } = useContext(StoreContext);

  const isHomeScreen = store.mind.mind === "root";

  const isMind = new URLSearchParams(store.searchParams).get("_") === "mind";

  const canOpenMind = isHomeScreen && isMind;

  return (
    <>
      <OverviewRecord
        index={props.index}
        record={props.item}
        isOpenDefault={true}
      />

      <button
        className={"edit"}
        onClick={() =>
          onRecordEdit(["record"], JSON.parse(JSON.stringify(props.item)))
        }
      >
        edit{" "}
      </button>

      <Confirmation
        action={`delete`}
        question={"really delete?"}
        onAction={() => onRecordWipe(props.item)}
      />

      <Show when={canOpenMind} fallback={<></>}>
        <button title="zip" onClick={() => onZip(props.item.mind)}>
          Zip{" "}
        </button>
      </Show>

      <Show when={canOpenMind} fallback={<></>}>
        <button
          title="open"
          onClick={async () => {
            const base = await getDefaultBase(props.item.mind);

            await onMindChange(`/${props.item.mind}`, `_=${base}`)
          }}
        >
          Open{" "}
        </button>
      </Show>
    </>
  );
}
