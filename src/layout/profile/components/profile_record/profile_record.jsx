import { useContext } from "solid-js";
import { StoreContext, onRecordEdit } from "@/store/index.js";
import { Spoiler } from "@/layout/components/index.js";
import { ProfileField, ProfileValue } from "../index.js";

export function ProfileRecord(props) {
  const { store } = useContext(StoreContext);

  const leaves = () => {
    if (
      store.schema === undefined ||
      store.schema[props.record._] === undefined
    )
      return [];

    return store.schema[props.record._].leaves;
  };

  return (
    <>
      <ProfileValue
        value={props.record[props.record._]}
        branch={props.record._}
        path={[...props.path, props.record._]}
      />

      <Spoiler index={`${props.index}-spoilerfield`} title={"with"}>
        <Index
          each={leaves()}
          fallback={<span>record but branch is twig</span>}
        >
          {(leaf, index) => (
            <ProfileField
              index={`${props.index}-${leaf()}`}
              branch={leaf()}
              items={props.record[leaf()] ?? []}
              path={[...props.path, leaf()]}
            />
          )}
        </Index>

        <br />

        <Spoiler index={`${props.index}-spoileradd`} title={"add"}>
          <Index each={leaves()} fallback={<>...</>}>
            {(leaf, index) => {
              const addNew = () =>
                onRecordEdit(
                  [...props.path, leaf()],
                  [
                    {
                      _: leaf(),
                      [leaf()]: "",
                    },
                  ],
                );

              const addAnother = () =>
                onRecordEdit(
                  [...props.path, leaf(), props.record[leaf()].length],
                  {
                    _: leaf(),
                    [leaf()]: "",
                  },
                );

              return (
                <button
                  className={"profileAddNew"}
                  onClick={() =>
                    Object.hasOwn(props.record, leaf())
                      ? addAnother()
                      : addNew()
                  }
                >
                  {leaf()}{" "}
                </button>
              );
            }}
          </Index>
        </Spoiler>
      </Spoiler>
    </>
  );
}
