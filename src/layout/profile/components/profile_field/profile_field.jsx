import { createSignal } from "solid-js";
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
  const isRemote = () => {
    if (store.repo === undefined) return false;

    store.repo.repo === "root" && props.item._ === "remote_tag";
  };

  return (
    <>
      <br />

      <Spoiler index={`${props.index}-${props.i}-do`} title={"do"}>
        <Confirmation
          action={`Remove this ${props.branch}`}
          question={"really remove?"}
          onAction={() =>
            onRecordEdit(
              props.path,
              props.items.filter((el, i) => i !== props.i),
            )
          }
        />

        <Show when={props.items.length > 1} fallback={<></>}>
          <Confirmation
            action={`Remove each ${props.branch}`}
            question={"really remove?"}
            onAction={() => onRecordEdit(props.path, undefined)}
          />
        </Show>

        <a
          className={"profileAdd"}
          onClick={() =>
            onRecordEdit([...props.path, props.items.length], {
              _: props.branch,
              [props.branch]: "",
            })
          }
        >
          Add another {props.branch}{" "}
        </a>

        <Show when={isRemote()}>
          <a
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
          </a>

          <a
            onClick={() =>
              onPullRepo(store.record.repo, props.item.remote_name)
            }
          >
            pull{" "}
          </a>

          <a onClick={() => onPushRepo()}>push </a>
        </Show>
      </Spoiler>

      <ProfileFieldItem
        index={`${props.index}-${props.i}`}
        branch={props.branch}
        item={props.item}
        path={[...props.path, props.i]}
      />
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
