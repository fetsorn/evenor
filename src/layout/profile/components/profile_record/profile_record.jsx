import { useContext } from "solid-js";
import { StoreContext, isTwig } from "@/store/index.js";
import { ProfileField } from "../index.js";

export function ProfileRecord(props) {
  const { store } = useContext(StoreContext);

  const { _: branch } = props.record;

  const { leaves } = store.schema[branch];

  function recordHasLeaf(leaf) {
    return Object.hasOwn(props.record, leaf);
  }

  function addLeafValue(leaf) {
    const valueDefault = "";

    const value = isTwig(store.schema, leaf)
      ? valueDefault
      : { _: leaf, [leaf]: valueDefault };

    const valuesOld = props.record[leaf];

    const valuesNew =
      valuesOld === undefined ? [value] : [valuesOld, value].flat();

    const record = { ...props.record, [leaf]: valuesNew };

    props.onRecordChange(record);
  }

  function onFieldRemove(field) {
    const record = { ...props.record };

    delete record[field];

    props.onRecordChange(record);
  }

  function onFieldChange(field, value) {
    const record = { ...props.record };

    record[field] = value;

    props.onRecordChange(record);
  }

  return (
    <span>
      <span>
        {branch}: <span contenteditable={true}>{props.record[branch]}</span>{" "}
        <span> </span>
      </span>

      <span> </span>

      <For each={leaves} fallback={<span>record no items</span>}>
        {(leaf, index) => {
          if (recordHasLeaf(leaf)) {
            const value = props.record[leaf];

            const items = Array.isArray(value) ? value : [value];

            return (
              <span>
                <span> </span>

                <ProfileField
                  index={`${props.index}-${leaf}`}
                  baseRecord={props.baseRecord}
                  branch={leaf}
                  items={items}
                  onFieldChange={onFieldChange}
                  onFieldRemove={onFieldRemove}
                />

                <span> </span>

                <a onClick={() => addLeafValue(leaf)}>Add another {leaf} </a>
              </span>
            );
          } else {
            return <a onClick={() => addLeafValue(leaf)}>Add {leaf} </a>;
          }
        }}
      </For>
    </span>
  );
}
