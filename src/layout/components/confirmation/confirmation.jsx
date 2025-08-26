import { createSignal } from "solid-js";

export function Confirmation(props) {
  const [confirmation, setConfirmation] = createSignal(false);

  return (
    <Show
      when={confirmation()}
      fallback={
        <button
          className={"confirmationAction"}
          onClick={() => setConfirmation(true)}
        >
          {props.action}{" "}
        </button>
      }
    >
      <>
        <span className={"confirmationQuestion"}>{props.question} </span>

        <button
          className={"confirmationYes"}
          onClick={async () => {
            await props.onAction();

            setConfirmation(false);
          }}
        >
          Yes{" "}
        </button>

        <button
          className={"confirmationNo"}
          onClick={async () => {
            if (typeof props.onCancel === 'function') {
              await props.onCancel();
            }

            setConfirmation(false)
          }}
        >
          No{" "}
        </button>
      </>
    </Show>
  );
}
