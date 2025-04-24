import { createSignal } from "solid-js";
import { ProfileFieldItem } from "../index.js";
import { StoreContext, onRecordEdit } from "@/store/index.js";
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
              <ProfileFieldItem
                index={`${props.index}-${index}`}
                branch={props.branch}
                item={item()}
                path={[...props.path, index]}
              />

              <span> </span>

              <Confirmation
                action={`Remove this ${props.branch}`}
                question={"really remove?"}
                onAction={() =>
                  onRecordEdit(
                    props.path,
                    props.items.filter((el, i) => i !== index),
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
        onAction={() => onRecordEdit(props.path, undefined)}
      />
    </>
  );
}
