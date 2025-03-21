import { useContext, createSignal } from "solid-js";
import { StoreContext, isTwig } from "@/store/index.js";
import { ProfileRecord, ProfileValue } from "../index.js";

export function ProfileFieldItem(props) {
  const { store } = useContext(StoreContext);

  const [confirmation, setConfirmation] = createSignal(false);

  const branchIsTwig = isTwig(store.schema, props.branch);

  if (branchIsTwig) {
    return <ProfileValue value={props.item} />;
  }

  return (
    <span>
      <ProfileRecord
        index={`${props.index}-${props.item[props.item._]}`}
        baseRecord={props.baseRecord}
        record={props.item}
        onRecordChange={(record) => props.onFieldItemChange(record)}
        onRecordRemove={() => onFieldItemRemove()}
      />

      <span> </span>

      <Show
        when={confirmation()}
        fallback={
          <a onClick={() => setConfirmation(true)}>
            Remove this {props.branch}
          </a>
        }
      >
        <span>
          really remove?
          <a onClick={() => onFieldItemRemove()}>Yes</a>
          <span> </span>
          <a onClick={() => setConfirmation(false)}>No</a>
        </span>
      </Show>
    </span>
  );
}
