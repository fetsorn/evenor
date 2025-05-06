import { createContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { createRecord } from "@/store/impure.js";
import { push, pull } from "@/store/record.js";
import { clone } from "@/store/open.js";
import { saveRecord, wipeRecord, changeRepo, search } from "@/store/action.js";
import { findFirstSortBy } from "@/store/pure.js";
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
  loading: false,
});

export function getSortedRecords() {
  return store.records.toSorted((a, b) => {
    if (store.searchParams === undefined) return 0;

    const sortBy = store.searchParams.get(".sortBy");

    const valueA = findFirstSortBy(sortBy, a[sortBy]);

    const valueB = findFirstSortBy(sortBy, b[sortBy]);

    const sortDirection = store.searchParams.get(".sortDirection");

    switch (sortDirection) {
      case "first":
        return valueA.localeCompare(valueB);
      case "last":
        return valueB.localeCompare(valueA);
      default:
        return valueA.localeCompare(valueB);
    }
  });
}

export function getFilterQueries() {
  if (store.searchParams === undefined) return [];

  // convert entries iterator to array for Index
  return Array.from(
    store.searchParams.entries().filter(([key]) => key !== ".sortDirection"),
  );
}

export function getFilterOptions() {
  if (store.schema === undefined || store.searchParams === undefined) return [];

  // find all fields name
  const leafFields = store.schema[store.searchParams.get("_")].leaves.concat([
    store.searchParams.get("_"),
    "__",
  ]);

  // find field name which is added to filter search params
  const addedFields = Array.from(store.searchParams.keys());

  // find name fields which is not added to filter search params
  const notAddedFields = leafFields.filter((key) => !addedFields.includes(key));

  return notAddedFields;
}

export function getSpoilerOpen(index) {
  return store.spoilerMap[index];
}

export function setSpoilerOpen(index, isOpen) {
  setStore("spoilerMap", { [index]: isOpen });
}

export async function onRecordCreate() {
  const record = await createRecord(
    store.repo.repo,
    store.searchParams.get("_"),
  );

  setStore(
    produce((state) => {
      state.record = record;
    }),
  );
}

export async function onRecordEdit(path, value) {
  setStore(...path, value);
}

export async function onRecordSave(recordOld, recordNew) {
  const records = await saveRecord(
    store.repo.repo,
    store.searchParams.get("_"),
    store.records,
    recordOld,
    recordNew,
  );

  setStore(
    produce((state) => {
      state.records = records;
      state.record = undefined;
    }),
  );
}

export async function onRecordWipe(record) {
  const records = await wipeRecord(
    store.repo.repo,
    store.searchParams.get("_"),
    store.records,
    record,
  );

  setStore(
    produce((state) => {
      state.records = records;
    }),
  );
}

export function appendRecord(record) {
  setStore("records", store.records.length, record);
}

export async function onSearch(field, value) {
  try {
    const { searchParams, abortPreviousStream, startStream } = await search(
      store.schema,
      store.searchParams,
      store.repo.repo,
      store.repo.reponame,
      field,
      value,
      appendRecord,
    );

    // stop previous stream
    await store.abortPreviousStream();

    setStore(
      produce((state) => {
        state.searchParams = searchParams;
        // solid store tries to call the function, so pass a factory here
        state.abortPreviousStream = () => abortPreviousStream;
        // erase existing records
        state.records = [];
      }),
    );

    // start appending records
    await startStream();
  } catch (e) {
    console.log(e);

    setStore(
      produce((state) => {
        // erase existing records
        state.records = [];
      }),
    );
  }
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

  // TODO somewhere here in case of error doesn't change url to root

  const { repo, schema, searchParams } = result;

  setStore(
    produce((state) => {
      state.repo = repo;
      state.schema = schema;
      state.searchParams = searchParams;
    }),
  );

  // start a search stream
  await onSearch("", undefined);
}

export async function onClone(
  repouuid,
  reponame,
  remoteTag,
  remoteUrl,
  remoteToken,
) {
  try {
    const { repo } = await clone(remoteUrl, remoteToken, repouuid, reponame);

    setStore(
      produce((state) => {
        state.record = repo;
      }),
    );
  } catch (e) {
    console.log("clone failed", e);
    // do nothing
  }
}

export async function onPullRepo(repo, remote) {
  setStore("loading", true);

  try {
    await pull(repo, remote);
  } catch (e) {
    console.log(e);
  }

  setStore("loading", false);
}

export async function onPushRepo(repo, remote) {
  setStore("loading", true);

  try {
    await push(repo, remote);
  } catch (e) {
    console.log(e);
  }

  setStore("loading", false);
}

// lateral jump
export async function leapfrog(branch, value, cognate) {
  await onSearch(undefined, undefined);

  await onSearch("_", store.searchParams.get("_"));

  await onSearch("__", cognate);

  await onSearch(branch, value);
}

// deep jump
export async function backflip(branch, value, cognate) {
  await onSearch(undefined, undefined);

  await onSearch("_", cognate);

  await onSearch("__", branch);

  await onSearch(cognate, value);
}

export async function sidestep(branch, value, cognate) {
  await onSearch(undefined, undefined);

  await onSearch("_", cognate);

  await onSearch(cognate, value);
}

// side jump
export async function warp(branch, value, cognate) {
  await onSearch(undefined, undefined);

  await onSearch("_", store.schema[cognate].trunks[0]);

  await onSearch("__", cognate);

  await onSearch(store.schema[cognate].trunks[0], value);
}
