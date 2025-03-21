import { createContext } from "solid-js";
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
  function open() {
    setIsOpen(props.index, true);
  }

  function close() {
    setIsOpen(props.index, false);
  }

  return (
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
  );
}
