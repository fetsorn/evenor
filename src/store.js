import { createContext } from "solid-js";
import { createStore } from "solid-js/store";

export const StoreContext = createContext();

export const [store, setStore] = createStore({
  record: undefined,
  records: Array.from({ length: 30 }, (_, i) => `Item ${i}`),
});
