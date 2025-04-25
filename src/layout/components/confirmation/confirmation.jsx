import { createSignal } from "solid-js";

export function Confirmation(props) {
  const [confirmation, setConfirmation] = createSignal(false);

  return (
    <Show
      when={confirmation()}
      fallback={<a onClick={() => setConfirmation(true)}>{props.action}</a>}
    >
      <span>
        <span>{props.question}</span>

        <a onClick={() => props.onAction()}>Yes</a>

        <span> </span>

        <a onClick={() => setConfirmation(false)}>No</a>
      </span>
    </Show>
  );
}
