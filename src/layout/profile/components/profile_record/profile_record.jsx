import { useContext } from "solid-js";
import { StoreContext, onRecordEdit } from "@/store/index.js";
import { Spoiler } from "@/layout/components/index.js";
import { ProfileField, ProfileValue } from "../index.js";

export function ProfileRecord(props) {
  const { store } = useContext(StoreContext);

  const options = () => {
    if (
      store.schema === undefined ||
      store.schema[props.record._] === undefined
    )
      return [];

    return store.schema[props.record._].leaves.filter(
      (leaf) => !Object.hasOwn(props.record, leaf),
    );
  };

  return (
    <>
      <ProfileValue
        value={props.record[props.record._]}
        branch={props.record._}
        path={[...props.path, "_"]}
      />

      <Spoiler index={`${props.index}-spoilerfield`} title={"with"}>
        <Index
          each={
            store.schema !== undefined &&
            store.schema[props.record._] !== undefined &&
            store.schema[props.record._].leaves
          }
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

        <Spoiler index={`${props.index}-spoileradd`} title={"add"}>
          <Index each={options()} fallback={<>wtf</>}>
            {(option, index) => (
              <a
                className={"profileAddNew"}
                onClick={() =>
                  onRecordEdit(
                    [...props.path, option()],
                    [
                      {
                        _: option(),
                        [option()]: "",
                      },
                    ],
                  )
                }
              >
                {option()}{" "}
              </a>
            )}
          </Index>
        </Spoiler>
      </Spoiler>
    </>
  );
}
