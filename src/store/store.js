import { createContext } from "solid-js";
import { createStore } from "solid-js/store";
import history from "history/hash";
import {
  findRecord,
  saveRecord,
  editRecord,
  wipeRecord,
  repoFromURL,
  changeRepo,
} from "./action.js";
import { changeSearchParams, makeURL, searchParamsFromURL } from "./pure.js";
import schemaRoot from "./default_root_schema.json";

export const StoreContext = createContext();

export const [store, setStore] = createStore({
  abortPreviousStream: async () => {},
  searchParams: new URLSearchParams("_=repo"),
  repo: { _: "repo", repo: "root" },
  schema: schemaRoot,
  record: undefined,
  records: [],
});

export async function onRecordEdit(recordNew) {
  const record = await editRecord(
    store.repo.repo,
    store.searchParams.get("_"),
    recordNew,
  );

  // set to undefined to delete from store
  // without this the object would shallow merge
  // and deleted fields would restore
  setStore({ record: undefined });

  // overwrite the record
  setStore({ record });
}

export async function onRecordSave(recordOld, recordNew) {
  const records = await saveRecord(
    store.repo.repo,
    store.searchParams.get("_"),
    store.records,
    recordOld,
    recordNew,
  );

  setStore("records", records);

  setStore("record", undefined);
}

export async function onRecordWipe(record) {
  if (record === undefined) {
    setStore("record", undefined);

    return;
  }

  const records = await wipeRecord(
    store.repo.repo,
    store.searchParams.get("_"),
    store.records,
    record,
  );

  setStore("records", records);
}

export async function onSearch(field, value) {
  // update searchParams in store
  const searchParams = changeSearchParams(
    store.schema,
    store.searchParams,
    field,
    value,
  );

  // set to undefined to overwrite
  setStore("searchParams", undefined);

  setStore({ searchParams });

  const url = makeURL(
    searchParams,
    value,
    store.repo.repo,
    store.repo.reponame,
  );

  window.history.replaceState(null, null, urlNew);

  if (field === ".sortBy" || field === ".sortDirection") return;

  // stop previous stream
  await store.abortPreviousStream();

  function appendRecord(record) {
    setStore("records", store.records.length, record);
  }

  const { abortPreviousStream, startStream } = findRecord(
    store.repo.repo,
    appendRecord,
    searchParams,
  );

  // solid store tries to call the function, so pass a factory here
  setStore("abortPreviousStream", () => abortPreviousStream);

  // erase existing records
  setStore("records", []);

  await startStream();
}

export async function onRepoChange(uuid, base) {
  const { repo, schema, searchParams } = await changeRepo(uuid, base);

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

export async function onLaunch() {
  const { schema, repo } = await repoFromURL(
    history.location.search,
    history.location.pathname,
  );

  setStore("repo", repo);

  // set to undefined to overwrite
  setStore("schema", undefined);

  setStore("schema", schema);

  // get searchParams from url
  const searchParams = searchParamsFromURL(history.location.search);

  // set to undefined to overwrite
  setStore("searchParams", undefined);

  setStore("searchParams", searchParams);

  // start a search stream
  await onSearch("", undefined);
}
