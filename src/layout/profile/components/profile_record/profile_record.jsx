import { useContext } from "solid-js";
import {
  StoreContext,
  onRecordEdit,
  onClone,
  onPullRepo,
  onPushRepo,
} from "@/store/index.js";
import { Spoiler, Confirmation } from "@/layout/components/index.js";
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

  const isRemote = () => {
    if (store.repo === undefined) return false;

    return store.repo.repo === "root" && props.record._ === "remote_tag";
  };

  return (
    <>
      <ProfileValue
        value={props.record[props.record._]}
        branch={props.record._}
        path={[...props.path, props.record._]}
      />

      <Show when={isRemote()}>
        <Confirmation
          action={`clone...`}
          question={"really overwrite?"}
          onAction={() =>
            onClone(
              store.record.repo,
              store.record.reponame[0],
              Array.isArray(props.record.remote_url)
                ? props.record.remote_url[0]
                : props.record.remote_url,
              props.record.remote_token === undefined
                ? undefined
                : props.record.remote_token[0],
            )
          }
        />

        <button
          onClick={() =>
            onPullRepo(
              store.record.repo,
              props.record.remote_tag,
              Array.isArray(props.record.remote_url)
                ? props.record.remote_url[0]
                : props.record.remote_url,
              props.record.remote_token === undefined
                ? undefined
                : props.record.remote_token[0],
            )
          }
        >
          pull{" "}
        </button>

        <button
          onClick={() =>
            onPushRepo(
              store.record.repo,
              props.record.remote_tag,
              Array.isArray(props.record.remote_url)
                ? props.record.remote_url[0]
                : props.record.remote_url,
              props.record.remote_token === undefined
                ? undefined
                : props.record.remote_token[0],
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
