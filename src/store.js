import { createContext } from "solid-js";
import { createStore } from "solid-js/store";

export const StoreContext = createContext();

export const [store, setStore] = createStore({
  record: undefined,
  records: Array.from({ length: 30 }, (_, i) => `Item ${i}`),
});

export async function onLaunch() {}

export async function onSearch() {}

export async function onRecordPick(record) {
  setStore("record", record);
}

export async function onRecordEdit(record) {}

export async function onRecordSave(record) {}

export async function onRecordWipe(record) {}
