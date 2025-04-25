import { createSignal } from "solid-js";

export function Confirmation(props) {
  const [confirmation, setConfirmation] = createSignal(false);

  return (
    <Show
      when={confirmation()}
      fallback={
        <a
          className={"confirmationAction"}
          onClick={() => setConfirmation(true)}
        >
          {props.action}{" "}
        </a>
      }
    >
      <>
        <span className={"confirmationQuestion"}>{props.question} </span>

        <a className={"confirmationYes"} onClick={() => props.onAction()}>
          Yes{" "}
        </a>

        <a className={"confirmationNo"} onClick={() => setConfirmation(false)}>
          No{" "}
        </a>
      </>
    </Show>
  );
}
