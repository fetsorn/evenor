import { createEffect } from "solid-js";
import { getSpoilerOpen, setSpoilerOpen } from "@/store/index.js";

export function Spoiler(props) {
  createEffect(() => {
    if (getSpoilerOpen(props.index) === undefined) {
      setSpoilerOpen(props.index, props.isOpenDefault);
    }
  });

  function open() {
    setSpoilerOpen(props.index, true);
  }

  function close() {
    setSpoilerOpen(props.index, false);
  }

  return (
    <Show
      when={getSpoilerOpen(props.index)}
      fallback={<a onClick={open}>{props.title}... </a>}
    >
      <span>
        <a onClick={close}>{props.title}:</a>

        <span> </span>

        {props.children}
      </span>
    </Show>
  );
}
