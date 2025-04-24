import { createSignal } from "solid-js";
import { ProfileFieldItem } from "../index.js";
import { onFieldItemChange, onFieldItemRemove } from "@/store/index.js";
import { Spoiler, Confirmation } from "@/layout/components/index.js";

export function ProfileField(props) {
  const [confirmationBulk, setConfirmationBulk] = createSignal(false);

  return (
    <>
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
                  onFieldItemChange(
                    index,
                    i,
                    props.items,
                    props.branch,
                    props.onFieldChange,
                  )
                }
                onFieldItemRemove={() =>
                  onFieldItemRemove(
                    index,
                    items,
                    branch,
                    props.onFieldRemove,
                    props.onFieldChange,
                  )
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
    </>
  );
}
