import { useContext, useState } from "solid-js";
import {
  StoreContext,
  onRecordEdit,
  onClone,
  onPull,
  onPush,
} from "@/store/index.js";
import { Spoiler, Confirmation } from "@/layout/components/index.js";
import { ProfileField, ProfileValue } from "../index.js";

export function LearnDropdown(props) {
  const { store } = useContext(StoreContext);

  const { chosen, setChosen } = useState("");

  return (
    <>
      <select
        id="learnDropdown"
        value={chosen}
        onChange={({ target: { value } }) => setChosen(value)}
      >
        <For
          each={store.records
            .map((mindRecord) => mindRecord.mind)
            .filter((mind) => mind !== store.record.mind)}
        >
          {(field) => <option value={field}>{field}</option>}
        </For>
      </select>

      <button onClick={() => onLearn()}>learn </button>
    </>
  );
}

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

  const isMind = () => {
    if (store.mind === undefined) return false;

    return store.mind.mind === "root" && store.record._ === "mind";
  };

  const isRemote = () => {
    if (store.mind === undefined) return false;

    return store.mind.mind === "root" && props.record._ === "origin_url";
  };

  return (
    <>
      <ProfileValue
        value={props.record[props.record._]}
        branch={props.record._}
        path={[...props.path, props.record._]}
      />

      <Show when={isMind()}>
        <LearnDropdown />
      </Show>

      <Show when={isRemote()}>
        <Confirmation
          action={`clone...`}
          question={"really overwrite?"}
          onAction={() =>
            onClone(
              store.record.mind,
              store.record.name[0],
              Array.isArray(props.record.origin_url)
                ? props.record.origin_url[0]
                : props.record.origin_url,
              props.record.origin_token === undefined
                ? undefined
                : props.record.origin_token[0],
            )
          }
        />

        <button
          onClick={() =>
            onPull(
              store.record.mind,
              Array.isArray(props.record.origin_url)
                ? props.record.origin_url[0]
                : props.record.origin_url,
              props.record.origin_token === undefined
                ? undefined
                : props.record.origin_token[0],
            )
          }
        >
          pull{" "}
        </button>

        <button
          onClick={() =>
            onPush(
              store.record.mind,
              Array.isArray(props.record.origin_url)
                ? props.record.origin_url[0]
                : props.record.origin_url,
              props.record.origin_token === undefined
                ? undefined
                : props.record.origin_token[0],
            )
          }
        >
          push{" "}
        </button>
      </Show>

      <Spoiler
        index={`${props.index}-spoilerfield`}
        title={"with"}
        isOpenDefault={props.isOpenDefault}
      >
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
      </Spoiler>
    </>
  );
}
