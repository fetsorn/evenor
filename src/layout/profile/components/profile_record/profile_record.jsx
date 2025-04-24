import { useContext } from "solid-js";
import { StoreContext, onRecordEdit } from "@/store/index.js";
import { ProfileField, ProfileValue } from "../index.js";
import api from "@/api/index.js";

export function Foo(props) {
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
          branch={props.leaf}
          items={items}
          path={[...props.path, props.leaf]}
        />

        <span> </span>

        <a
          onClick={() =>
            onRecordEdit([...props.path, items.length], {
              _: props.leaf,
              [props.leaf]: "",
            })
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
          onRecordEdit(props.path, {
            _: props.leaf,
            [props.leaf]: "",
          })
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
        path={[...props.path, "_"]}
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
            index={props.index}
            path={[...props.path, item()]}
          />
        )}
      </Index>
    </span>
  );
}
