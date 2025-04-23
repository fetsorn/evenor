import { createSignal } from "solid-js";
import { ProfileFieldItem } from "../index.js";
import { Spoiler, Confirmation } from "@/layout/components/index.js";

export function onFieldItemChange(index, item, items, branch, onFieldChange) {
  // replace the new item at index
  const itemsNew = Object.assign([], items, { [index]: item });

  onFieldChange(branch, itemsNew);
}

export function onFieldItemRemove(
  index,
  items,
  branch,
  onFieldRemove,
  onFieldChange,
) {
  // replace the new item at index
  const itemsNew = [...items];

  itemsNew.splice(index, 1);

  if (itemsNew.length === 0) {
    onFieldRemove(branch);
  } else {
    onFieldChange(branch, itemsNew);
  }
}

export function ProfileField(props) {
  const [confirmationBulk, setConfirmationBulk] = createSignal(false);

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
                onFieldItemChange={(i) =>
                  onFieldItemChange(index, i, props.items, props.branch)
                }
                onFieldItemRemove={() =>
                  onFieldItemRemove(index, items, branch)
                }
              />
            </span>
          );
        }}
      </Index>

      <span> </span>

      <Confirmation
        action={`Remove each ${props.branch}`}
        question={"really remove?"}
        onAction={() => props.onFieldRemove(props.branch)}
      />
    </Spoiler>
  );
}
