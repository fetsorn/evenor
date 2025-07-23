import { createContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { createRecord, selectStream } from "@/store/impure.js";
import { push, pull, createRoot } from "@/store/record.js";
import { clone } from "@/store/open.js";
import { saveRecord, wipeRecord, changeMind } from "@/store/action.js";
import { sortCallback, changeSearchParams, makeURL } from "@/store/pure.js";
import schemaRoot from "@/store/default_root_schema.json";

export const StoreContext = createContext();

export const [store, setStore] = createStore({
  abortPreviousStream: async () => {},
  searchParams: new URLSearchParams("_=mind"),
  mind: { _: "mind", mind: "root" },
  schema: schemaRoot,
  record: undefined,
  records: [],
  spoilerMap: {},
  loading: false,
});

/**
 * This
 * @name getSortedRecords
 * @export function
 * @returns {Function}
 */
export function getSortedRecords(index) {
  const sortBy = store.searchParams.get(".sortBy");

  const sortDirection = store.searchParams.get(".sortDirection");

  const records = store.records.toSorted(sortCallback(sortBy, sortDirection));

  return records[index];
}

/**
 * This
 * @name getFilterQueries
 * @export function
 * @returns {String[]}
 */
export function getFilterQueries() {
  if (store.searchParams === undefined) return [];

  // convert entries iterator to array for Index
  return Array.from(
    store.searchParams.entries().filter(([key]) => key !== ".sortDirection"),
  );
}

/**
 * This
 * @name getFilterOptions
 * @export function
 * @returns {String[]}
 */
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

/**
 * This
 * @name getSpoilerOpen
 * @param {String} index -
 * @export function
 */
export function getSpoilerOpen(index) {
  return store.spoilerMap[index];
}

/**
 * This
 * @name setSpoilerOpen
 * @param {String} index -
 * @param {boolean} isOpen -
 * @export function
 */
export function setSpoilerOpen(index, isOpen) {
  setStore("spoilerMap", { [index]: isOpen });
}

/**
 * This
 * @name onRecordCreate
 * @export function
 */
export async function onRecordCreate() {
  const record = await createRecord(
    store.mind.mind,
    store.searchParams.get("_"),
  );

  setStore(
    produce((state) => {
      state.record = record;
    }),
  );
}

/**
 * This
 * @name onRecordEdit
 * @export function
 * @param {String[]} path -
 * @param {String} value -
 */
export async function onRecordEdit(path, value) {
  setStore(...path, value);
}

/**
 * This
 * @name onRecordSave
 * @export function
 * @param {object} recordOld -
 * @param {object} recordNew -
 */
export async function onRecordSave(recordOld, recordNew) {
  const records = await saveRecord(
    store.mind.mind,
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

/**
 * This
 * @name onRecordWipe
 * @export function
 * @param {object} record -
 */
export async function onRecordWipe(record) {
  const records = await wipeRecord(
    store.mind.mind,
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

/**
 * This
 * @name appendRecord
 * @export function
 * @param {object} record -
 */
export function appendRecord(record) {
  setStore("records", store.records.length, record);
}

/**
 * This
 * @name onSearch
 * @export function
 * @param {String} field -
 * @param {String} value -
 */
export async function onSearch(field, value) {
  try {
    // update searchParams
    const searchParams = changeSearchParams(store.searchParams, field, value);

    const url = makeURL(searchParams, store.mind.mind);

    window.history.replaceState(null, null, url);

    setStore(
      produce((state) => {
        state.searchParams = new URLSearchParams();
      }),
    );

    setStore(
      produce((state) => {
        state.searchParams = searchParams;
      }),
    );

    if (field.startsWith(".")) return undefined;

    const { abortPreviousStream, startStream } = await selectStream(
      store.schema,
      store.mind.mind,
      appendRecord,
      searchParams,
    );

    // stop previous stream
    await store.abortPreviousStream();

    setStore(
      produce((state) => {
        // solid store tries to call the function, so pass a factory here
        state.abortPreviousStream = () => abortPreviousStream;
        // erase existing records
        state.records = [];
      }),
    );

    // start appending records
    await startStream();
  } catch (e) {
    console.error(e);

    setStore(
      produce((state) => {
        // erase existing records
        state.records = [];
      }),
    );
  }
}

/**
 * This
 * @name onMindChange
 * @export function
 * @param {String} pathname -
 * @param {String} searchString -
 */
export async function onMindChange(pathname, searchString) {
  let result;

  // in case of error fallback to root
  try {
    result = await changeMind(pathname, searchString);
  } catch (e) {
    console.error(e);

    result = await changeMind("/", "_=mind");
  }

  // TODO somewhere here in case of error doesn't change url to root
  setStore(
    produce((state) => {
      // erase searchParams to re-render the filter index
      state.searchParams = new URLSearchParams();
      // erase records to re-render the overview
      state.records = [];
    }),
  );

  const { mind, schema, searchParams } = result;

  setStore(
    produce((state) => {
      state.mind = mind;
      state.schema = schema;
      state.searchParams = searchParams;
    }),
  );

  // start a search stream
  await onSearch("", undefined);
}

/**
 * This
 * @name onClone
 * @export function
 * @param {String} mind -
 * @param {String} name -
 * @param {String} remoteUrl -
 * @param {String} remoteToken -
 */
export async function onClone(mind, name, remoteUrl, remoteToken) {
  try {
    const { mind } = await clone(mind, name, remoteUrl, remoteToken);

    setStore(
      produce((state) => {
        state.record = mind;
      }),
    );
  } catch (e) {
    console.log("clone failed", e);
    // do nothing
  }
}

/**
 * This
 * @name onPull
 * @export function
 * @param {String} mind -
 * @param {String} remoteUrl -
 * @param {String} remoteToken -
 */
export async function onPull(mind, remoteUrl, remoteToken) {
  setStore("loading", true);

  try {
    await pull(mind, remoteUrl, remoteToken);
  } catch (e) {
    console.log(e);
  }

  setStore("loading", false);
}

/**
 * This
 * @name onPush
 * @export function
 * @param {String} mind -
 * @param {String} remoteUrl -
 * @param {String} remoteToken -
 */
export async function onPush(mind, remoteUrl, remoteToken) {
  setStore("loading", true);

  try {
    await push(mind, remoteUrl, remoteToken);
  } catch (e) {
    console.log(e);
  }

  setStore("loading", false);
}

/**
 * This lateral jumps
 * @name leapfrog
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function leapfrog(branch, value, cognate) {
  await onSearch(undefined, undefined);

  await onSearch("_", store.searchParams.get("_"));

  await onSearch("__", cognate);

  await onSearch(branch, value);
}

/**
 * This deep jumps
 * @name backflip
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function backflip(branch, value, cognate) {
  await onSearch(undefined, undefined);

  await onSearch("_", cognate);

  await onSearch("__", branch);

  await onSearch(cognate, value);
}

/**
 * This
 * @name sidestep
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function sidestep(branch, value, cognate) {
  await onSearch(undefined, undefined);

  await onSearch("_", cognate);

  await onSearch(cognate, value);
}

/**
 * This side jumps
 * @name warp
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function warp(branch, value, cognate) {
  await onSearch(undefined, undefined);

  await onSearch("_", store.schema[cognate].trunks[0]);

  await onSearch("__", cognate);

  await onSearch(store.schema[cognate].trunks[0], value);
}

/**
 * This
 * @name onStartup
 * @export function
 * @param {object} record -
 */
export async function onStartup() {
  createRoot();
}
