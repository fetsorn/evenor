import { useContext } from "solid-js";
import {
  StoreContext,
  onRecordEdit,
  addLeafValue,
  onFieldRemove,
  onFieldChange,
} from "@/store/index.js";
import { ProfileField, ProfileValue } from "../index.js";
import api from "@/api/index.js";

export function Foo(props) {
  const { store } = useContext(StoreContext);

  function recordHasLeaf(leaf) {
    return Object.hasOwn(props.record, leaf);
  }

  if (recordHasLeaf(props.leaf)) {
    const value = props.record[props.leaf];

    const items = Array.isArray(value) ? value : [value];

    return (
      <span>
        <span> </span>

        <ProfileField
          index={`${props.index}-${props.leaf}`}
          baseRecord={props.baseRecord}
          branch={props.leaf}
          items={items}
          onFieldChange={(field, value) =>
            onFieldChange(field, value, props.record, props.onRecordChange)
          }
          onFieldRemove={(field) =>
            onFieldRemove(field, props.record, props.onRecordRemove)
          }
        />

        <span> </span>

        <a
          onClick={() =>
            addLeafValue(
              store.schema,
              props.leaf,
              props.record,
              props.onRecordChange,
            )
          }
        >
          Add another {props.leaf}{" "}
        </a>
      </span>
    );
  } else {
    return (
      <a
        onClick={() =>
          addLeafValue(
            store.schema,
            props.leaf,
            props.record,
            props.onRecordChange,
          )
        }
      >
        Add {props.leaf}{" "}
      </a>
    );
  }
}

export function ProfileRecord(props) {
  const { store } = useContext(StoreContext);

  return (
    <span>
      <ProfileValue
        value={props.record[props.record._]}
        branch={props.record._}
        onValueChange={(value) =>
          onFieldChange(
            props.record._,
            value,
            props.record,
            props.onRecordChange,
          )
        }
      />

      <span> </span>

      <Index
        each={
          store.schema !== undefined &&
          store.schema[props.record._] !== undefined &&
          store.schema[props.record._].leaves
        }
        fallback={<span>record no items</span>}
      >
        {(item, index) => (
          <Foo
            leaf={item()}
            record={props.record}
            baseRecord={props.baseRecord}
            index={props.index}
            onRecordChange={props.onRecordChange}
          />
        )}
      </Index>
    </span>
  );
}
