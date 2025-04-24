import { createContext } from "solid-js";
import { createStore } from "solid-js/store";
import {
  editRecord,
  saveRecord,
  wipeRecord,
  changeRepo,
  search,
} from "@/store/action.js";
import schemaRoot from "@/store/default_root_schema.json";

export const StoreContext = createContext();

export const [store, setStore] = createStore({
  abortPreviousStream: async () => {},
  searchParams: new URLSearchParams("_=repo"),
  repo: { _: "repo", repo: "root" },
  schema: schemaRoot,
  record: undefined,
  records: [],
  spoilerMap: {},
});

export function getSpoilerOpen(index) {
  return store.spoilerMap[index];
}

export function setSpoilerOpen(index, isOpen) {
  setStore("spoilerMap", { [index]: isOpen });
}

export async function onRecordEdit(recordNew) {
  const record = await editRecord(
    store.repo.repo,
    store.searchParams.get("_"),
    recordNew,
  );

  // TODO use store path to overwrite the record

  // set to undefined to delete from store
  // without this the object would shallow merge
  // and deleted fields would restore
  setStore({ record: undefined });

  // overwrite the record
  setStore({ record });
}

export async function onRecordEditPrime(path, value) {
  setStore("record", path, value);
}

export async function onRecordSave(recordOld, recordNew) {
  const records = await saveRecord(
    store.repo.repo,
    store.searchParams.get("_"),
    store.records,
    recordOld,
    recordNew,
  );

  // TODO use store path to update the record

  setStore("records", undefined);

  setStore("records", records);

  setStore("record", undefined);
}

export async function onRecordWipe(record) {
  const records = await wipeRecord(
    store.repo.repo,
    store.searchParams.get("_"),
    store.records,
    record,
  );

  // TODO use store path to delete the record

  setStore("records", undefined);

  setStore("records", records);
}

export function appendRecord(record) {
  setStore("records", store.records.length, record);
}

export async function onSearch(field, value) {
  const { searchParams, abortPreviousStream, startStream } = await search(
    store.schema,
    store.searchParams,
    store.repo.repo,
    store.repo.reponame,
    field,
    value,
    appendRecord,
  );

  // set to undefined to overwrite
  setStore("searchParams", undefined);

  setStore({ searchParams });

  // stop previous stream
  await store.abortPreviousStream();

  // solid store tries to call the function, so pass a factory here
  setStore("abortPreviousStream", () => abortPreviousStream);

  // erase existing records
  setStore("records", []);

  // start appending records
  await startStream();
}

export async function onRepoChange(pathname, search) {
  let result;

  // in case of error fallback to root
  try {
    result = await changeRepo(pathname, search);
  } catch (e) {
    console.log(e);

    result = await changeRepo("/", "_=repo");
  }

  const { repo, schema, searchParams } = result;

  setStore("repo", repo);

  // set to undefined to overwrite
  setStore("schema", undefined);

  setStore("schema", schema);

  // set to undefined to overwrite
  setStore("searchParams", undefined);

  setStore("searchParams", searchParams);

  // start a search stream
  await onSearch("", undefined);
}
