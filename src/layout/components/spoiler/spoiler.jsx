import { createContext, createEffect } from "solid-js";
import { createStore } from "solid-js/store";

export const StoreContext = createContext();

export const [store, setStore] = createStore({
  indexMap: {},
});

function isOpen(index) {
  return store.indexMap[index];
}

function setIsOpen(index, isOpen) {
  setStore("indexMap", { [index]: isOpen });
}

export function Spoiler(props) {
  createEffect(() => {
    setIsOpen(props.index, props.isOpenDefault);
  });

  function hasChildren() {
    const children = props.children();

    const isOne = children.length === 1;

    if (isOne) {
      const isArray = Array.isArray(children[0]);

      if (isArray) {
        const isEmptyArray = children[0].length === 0;

        if (isEmptyArray) {
          return false;
        }
      }
    }

    return true;
  }

  function open() {
    setIsOpen(props.index, true);
  }

  function close() {
    setIsOpen(props.index, false);
  }

  return (
    <Show when={hasChildren()} fallback={<></>}>
      <Show
        when={isOpen(props.index)}
        fallback={<a onClick={open}>{props.title}... </a>}
      >
        <span>
          <a onClick={close}>{props.title}:</a>

          <span> </span>

          {props.children}
        </span>
      </Show>
    </Show>
  );
}
