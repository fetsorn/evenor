import { createEffect, createSignal } from "solid-js";
import { getSpoilerOpen, setSpoilerOpen } from "@/store/index.js";

export function Spoiler(props) {
  const [isOpen, setIsOpen] = createSignal(props.isOpenDefault);

  //createEffect(() => {
  //  if (getSpoilerOpen(props.index) === undefined) {
  //    setSpoilerOpen(props.index, props.isOpenDefault);
  //  }
  //});

  function open() {
    setIsOpen(true);
    //setSpoilerOpen(props.index, true);
  }

  function close() {
    setIsOpen(false);
    //setSpoilerOpen(props.index, false);
  }

  return (
    <Show
      /* when={getSpoilerOpen(props.index)} */
      when={isOpen()}
      fallback={
        <a className={"spoilerOpen"} onClick={open}>
          {props.title}...{" "}
        </a>
      }
    >
      <>
        <a className={"spoilerClose"} onClick={close}>
          {props.title}:{" "}
        </a>

        {props.children}
      </>
    </Show>
  );
}
