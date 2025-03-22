import { useContext } from "solid-js";
import { StoreContext, isTwig } from "@/store/index.js";
import { ProfileField, ProfileValue } from "../index.js";

export function ProfileRecord(props) {
  const { store } = useContext(StoreContext);

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
    const { [field]: omit, ...recordWithoutField } = props.record;

    props.onRecordChange(recordWithoutField);
  }

  function onFieldChange(field, value) {
    const record = { ...props.record, [field]: value };

    props.onRecordChange(record);
  }

  return (
    <span>
      <ProfileValue
        value={props.record[props.record._]}
        branch={props.record._}
        onValueChange={(value) => onFieldChange(props.record._, value)}
      />

      <span> </span>

      <Index
        each={store.schema[props.record._].leaves}
        fallback={<span>record no items</span>}
      >
        {(item, index) => {
          const leaf = item();

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
      </Index>
    </span>
  );
}
