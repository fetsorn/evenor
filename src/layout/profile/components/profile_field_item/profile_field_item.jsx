import { useContext, createSignal } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { Confirmation } from "@/layout/components/index.js";
import { ProfileRecord, ProfileValue } from "../index.js";

export function Foo(props) {
  const { store } = useContext(StoreContext);

  // if branch has no leaves, show value
  // otherwise show record with buttons that can add leaves
  const branchIsTwig = () => {
    if (store.schema === undefined || store.schema[props.branch] === undefined)
      return true;

    return store.schema[props.branch].leaves.length === 0;
  };

  if (branchIsTwig()) {
    // if twig is object, pass base value
    // otherwise pass string
    const value =
      typeof props.item === "object" ? props.item[props.branch] : props.item;

    return (
      <ProfileValue value={value} onValueChange={props.onFieldItemChange} />
    );
  }

  return (
    <ProfileRecord
      index={`${props.index}-${props.item[props.item._]}`}
      baseRecord={props.baseRecord}
      record={props.item}
      onRecordChange={(record) => props.onFieldItemChange(record)}
      onRecordRemove={() => props.onFieldItemRemove()}
    />
  );
}

export function ProfileFieldItem(props) {
  return (
    <span>
      <Foo
        item={props.item}
        index={props.index}
        baseRecord={props.baseRecord}
        branch={props.branch}
        onFieldItemChange={props.onFieldItemChange}
        onFieldItemRemove={props.onFieldItemRemove}
      />

      <span> </span>

      <Confirmation
        action={`Remove this ${props.branch}`}
        question={"really remove?"}
        onAction={props.onFieldItemRemove}
      />
    </span>
  );
}
