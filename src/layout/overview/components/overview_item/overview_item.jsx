import { createSignal } from "solid-js";
import { onRecordEdit, onRecordWipe } from "@/store/index.js";
import { OverviewRecord } from "../index.js";

export function OverviewItem(props) {
  const [confirmation, setConfirmation] = createSignal(false);

  return (
    <span>
      <a onClick={() => onRecordEdit(props.item)}>edit</a>

      <span> </span>

      <Show
        when={confirmation()}
        fallback={<a onClick={() => setConfirmation(true)}>delete</a>}
      >
        <span>
          really remove?
          <a onClick={() => onRecordWipe(props.item)}>Yes</a>
          <a onClick={() => setConfirmation(false)}>No</a>
        </span>
      </Show>

      <span> </span>

      <OverviewRecord baseRecord={props.item} record={props.item} />
    </span>
  );
}
