import { createSignal } from "solid-js";
import { ProfileFieldItem } from "../index.js";
import { Spoiler } from "@/layout/components/index.js";

export function ProfileField(props) {
  const [confirmationBulk, setConfirmationBulk] = createSignal(false);

  function onFieldItemChange(index, item) {
    // replace the new item at index
    const items = Object.assign([], props.items, { [index]: item });

    props.onFieldChange(props.branch, items);
  }

  function onFieldItemRemove(index) {
    // replace the new item at index
    const items = [...props.items];

    items.splice(index, 1);

    if (items.length === 0) {
      props.onFieldRemove(props.branch);
    } else {
      props.onFieldChange(props.branch, items);
    }
  }

  return (
    <Spoiler index={props.index} title={props.branch}>
      <Index each={props.items} fallback={<span>field no items</span>}>
        {(item, index) => {
          const [confirmation, setConfirmation] = createSignal(false);

          return (
            <span>
              <span> </span>

              <ProfileFieldItem
                index={`${props.index}-${index}`}
                baseRecord={props.baseRecord}
                branch={props.branch}
                item={item()}
                onFieldItemChange={(i) => onFieldItemChange(index, i)}
                onFieldItemRemove={() => onFieldItemRemove(index)}
              />

              <span> </span>

              <Show
                when={confirmation()}
                fallback={
                  <a onClick={() => setConfirmation(true)}>
                    Remove this {props.branch}
                  </a>
                }
              >
                <span>
                  really remove?
                  <a onClick={() => onFieldItemRemove(index)}>Yes</a>
                  <span> </span>
                  <a onClick={() => setConfirmation(false)}>No</a>
                </span>
              </Show>
            </span>
          );
        }}
      </Index>

      <span> </span>

      <Show
        when={confirmationBulk()}
        fallback={
          <a onClick={() => setConfirmationBulk(true)}>
            Remove each {props.branch}
          </a>
        }
      >
        <span>
          really remove?
          <a onClick={() => props.onFieldRemove(props.branch)}>Yes</a>
          <span> </span>
          <a onClick={() => setConfirmationBulk(false)}>No</a>
        </span>
      </Show>
    </Spoiler>
  );
}
