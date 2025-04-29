import { useContext } from "solid-js";
import { ProfileFieldItem } from "../index.js";
import {
  StoreContext,
  onRecordEdit,
  onClone,
  onPullRepo,
  onPushRepo,
} from "@/store/index.js";
import { Spoiler, Confirmation } from "@/layout/components/index.js";

// can't move this to field item
// because remove needs to filter props.items
export function Foo(props) {
  const { store } = useContext(StoreContext);

  const isRemote = () => {
    if (store.repo === undefined) return false;

    store.repo.repo === "root" && props.item._ === "remote_tag";
  };

  return (
    <>
      <br />

      <Confirmation
        action={`cut...`}
        question={"really cut?"}
        onAction={() =>
          onRecordEdit(
            props.path,
            props.items.filter((el, i) => i !== props.i),
          )
        }
      />

      <ProfileFieldItem
        index={`${props.index}-${props.i}`}
        branch={props.branch}
        item={props.item}
        path={[...props.path, props.i]}
      />

      <Show when={isRemote()}>
        <button
          onClick={() =>
            onClone(
              store.record.repo,
              store.record.reponame[0],
              props.item.remote_tag,
              props.item.remote_url[0],
              props.item.remote_token[0],
            )
          }
        >
          clone
        </button>

        <button
          onClick={() => onPullRepo(store.record.repo, props.item.remote_name)}
        >
          pull{" "}
        </button>

        <button onClick={() => onPushRepo()}>push </button>
      </Show>
    </>
  );
}

export function ProfileField(props) {
  const items = () =>
    Array.isArray(props.items) ? props.items : [props.items];

  return (
    <>
      <Show when={items()[0]}>
        <Foo
          index={`${props.index}`}
          branch={props.branch}
          path={props.path}
          item={items()[0]}
          items={items()}
          i={0}
        />
      </Show>

      <Show when={items().length > 1}>
        <br />

        <Spoiler index={`${props.index}spoiler`} title={"and"}>
          <Index each={items().slice(1)} fallback={<></>}>
            {(item, index) => (
              <Foo
                index={`${props.index}`}
                branch={props.branch}
                path={props.path}
                item={item()}
                items={items()}
                i={index + 1}
              />
            )}
          </Index>
        </Spoiler>
      </Show>
    </>
  );
}
