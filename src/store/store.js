/* try to keep store interactions only in this file */
import { createContext } from "solid-js";
import parser from "search-query-parser";
import diff from "microdiff";
import { getDefaultBase } from "@/store/pure.js";
import { createStore, produce } from "solid-js/store";
import { createRecord, selectStream, buildRecord } from "@/store/impure.js";
import { resolve, createRoot, readSchema, exportMind } from "@/store/record.js";
import { saveRecord, wipeRecord, changeMind } from "@/store/action.js";
import { sortCallback, changeSearchParams, makeURL } from "@/store/pure.js";
import schemaRoot from "@/store/default_root_schema.json";

export const StoreContext = createContext();

export const [store, setStore] = createStore({
  abortPreviousStream: async () => {},
  searchParams: "_=mind", // sets the state of search bar
  mind: { _: "mind", mind: "root", name: "minds" },
  schema: schemaRoot,
  record: undefined,
  recordSet: [],
  recordMap: {},
  spoilerMap: {},
  loading: false,
  searchBar: "", // remembers the last state of search bar
  mergeResult: false,
  streamCounter: 0,
});

export async function getRecord(record) {
  const key = record[record._];

  if (store.recordMap[key] === undefined) {
    const recordNew = await buildRecord(store.mind.mind, record);

    setStore("recordMap", { [key]: recordNew });
  }

  const recordNew = store.recordMap[key];

  return recordNew;
}

/**
 * This
 * @name getSortedRecords
 * @export function
 * @returns {Function}
 */
export function getSortedRecords() {
  const sortBy = new URLSearchParams(store.searchParams).get(".sortBy");

  const sortDirection = new URLSearchParams(store.searchParams).get(
    ".sortDirection",
  );

  const records = store.recordSet.toSorted(sortCallback(sortBy, sortDirection));

  return records;
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
  return Array.from(new URLSearchParams(store.searchParams).entries()).filter(
    ([key]) => key !== ".sortDirection",
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
  const leafFields = store.schema[
    new URLSearchParams(store.searchParams).get("_")
  ].leaves.concat([new URLSearchParams(store.searchParams).get("_"), "__"]);

  // find field name which is added to filter search params
  const addedFields = Array.from(
    new URLSearchParams(store.searchParams).keys(),
  );

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
    new URLSearchParams(store.searchParams).get("_"),
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
export function onRecordEdit(path, value) {
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
  setStore("loading", true);

  const records = await saveRecord(
    store.mind.mind,
    new URLSearchParams(store.searchParams).get("_"),
    store.recordSet,
    recordOld,
    recordNew,
  );

  try {
    const syncResult = await resolve(store.mind.mind);

    setStore(
      produce((state) => {
        state.mergeResult = syncResult.ok;
      }),
    );
  } catch (e) {
    // do nothing
    console.log(e);
  }

  setStore(
    produce((state) => {
      state.recordSet = records;
      state.record = undefined;
    }),
  );

  setStore("loading", false);
}

/**
 * This
 * @name onRecordWipe
 * @export function
 * @param {object} record -
 */
export async function onRecordWipe(record) {
  setStore("loading", true);

  const records = await wipeRecord(
    store.mind.mind,
    new URLSearchParams(store.searchParams).get("_"),
    store.recordSet,
    record,
  );

  try {
    const syncResult = await resolve(store.mind.mind);

    setStore(
      produce((state) => {
        state.mergeResult = syncResult.ok;
      }),
    );
  } catch (e) {
    // do nothing
    console.log(e);
  }

  setStore(
    produce((state) => {
      state.recordSet = records;
    }),
  );

  setStore("loading", false);
}

/**
 * This
 * @name appendRecord
 * @export function
 * @param {object} record -
 */
export function appendRecord(record) {
  setStore("recordSet", store.recordSet.length, record);
}

export async function onSort(field, value) {
  updateSearchParams(field, value);

  setStore(
    produce((state) => {
      state.recordSet = getSortedRecords();
    }),
  );
}

export async function onBase(value) {
  updateSearchParams("_", value);

  //await onSearch()
}

export async function onCancel() {
  await store.abortPreviousStream();

  setStore("loading", false);
}

/**
 * This
 * @name onSearch
 * @export function
 */
export async function onSearch() {
  setStore("loading", true);

  setStore("streamCounter", store.streamCounter + 1);

  try {
    // if search bar can be parsed as url, clone
    const url = new URL(store.searchBar);

    if (url.protocol === "http:" || url.protocol === "https:") {
      const searchString = url.hash.replace("#", "");

      // reset searchbar to avoid a loop
      // after onMindChange calls onSearch
      setStore(
        produce((state) => {
          state.searchBar = "";
        }),
      );

      await onMindChange("/", searchString);

      setStore("loading", false);

      return undefined;
    }
  } catch (e) {
    console.log(e);
    // do nothing
  }

  const url = makeURL(new URLSearchParams(store.searchParams), store.mind.mind);

  window.history.replaceState(null, null, url);

  // TODO: reset loading on the end of the stream
  try {
    const { abortPreviousStream, startStream } = await selectStream(
      store.schema,
      store.mind.mind,
      appendRecord,
      new URLSearchParams(store.searchParams),
      store.streamCounter,
    );

    // stop previous stream
    await store.abortPreviousStream();

    setStore(
      produce((state) => {
        // solid store tries to call the function, so pass a factory here
        state.abortPreviousStream = () => () => {
          return abortPreviousStream();
        };
        // erase existing records
        state.recordSet = [];
      }),
    );

    // start appending records
    await startStream();

    // TODO does it stop main?
    for (const record of store.recordSet) {
      await getRecord(record);
    }
  } catch (e) {
    console.error(e);

    setStore(
      produce((state) => {
        // erase existing records
        state.recordSet = [];
      }),
    );
  }

  const scroll = new URLSearchParams(store.searchParams).get(".scroll");

  if (scroll !== null) {
    const element = document.getElementById(scroll);

    element.scrollIntoView();
  }

  setStore("loading", false);
}

/**
 * This
 * @name onMindChange
 * @export function
 * @param {String} pathname -
 * @param {String} searchString -
 */
export async function onMindChange(pathname, searchString) {
  // try to stop the stream before changing minds
  await store.abortPreviousStream();

  // TODO somewhere here in case of error doesn't change url to root
  setStore(
    produce((state) => {
      // this updates the overview on change of params
      // and removes focus from the filter
      // erase searchParams to re-render the filter index
      state.searchParams = "";
      // erase records to re-render the overview
      state.recordSet = [];
    }),
  );

  let result;

  // in case of error fallback to root
  try {
    result = await changeMind(pathname, searchString);
  } catch (e) {
    console.error(e);

    result = await changeMind("/", "_=mind");
  }

  const { mind, schema, searchParams } = result;

  try {
    const syncResult = await resolve(mind.mind);

    setStore(
      produce((state) => {
        state.mergeResult = syncResult.ok;
      }),
    );
  } catch (e) {
    // do nothing
    console.log(e);
  }

  setStore(
    produce((state) => {
      state.mind = mind;
      state.schema = schema;
      state.searchParams = searchParams.toString();
    }),
  );

  const url = makeURL(searchParams, store.mind.mind);

  window.history.replaceState(null, null, url);

  // only search by default in the root mind
  if (mind.mind === "root") {
    // start a search stream
    await onSearch();
  }
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

  await onSearch("_", new URLSearchParams(store.searchParams).get("_"));

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
 */
export async function onStartup() {
  setStore("loading", true);

  createRoot();

  setStore("loading", false);
}

export function updateSearchParams(field, value) {
  // NOTE freeform text is not supported by csvs yet
  if (field !== "text") {
    const searchParams = changeSearchParams(
      new URLSearchParams(store.searchParams),
      field,
      value,
    );

    const url = makeURL(searchParams, store.mind.mind);

    window.history.replaceState(null, null, url);

    // do not reset searchParams here to preserve focus on filter
    setStore(
      produce((state) => {
        state.searchParams = searchParams.toString();
      }),
    );

    return true;
  }

  return false;
}

// diff changes to store.searchParams
function batchUpdateSearchParams(changes) {
  // only search if some field was updated
  // don't search on freeform text
  let doSearch = false;

  changes
    .filter((c) => c.path[0] !== "exclude" && c.path[0] !== "offsets")
    .forEach((change) => {
      switch (change.type) {
        case "REMOVE": {
          const field = change.path[0];

          doSearch = doSearch ? doSearch : updateSearchParams(field, undefined);

          break;
        }
        case "CREATE": {
          const field = change.path[0];

          doSearch = doSearch
            ? doSearch
            : updateSearchParams(field, change.value);

          break;
        }
        case "CHANGE": {
          const field = change.path[0];

          doSearch = doSearch
            ? doSearch
            : updateSearchParams(field, change.value);

          break;
        }
      }
    });

  return doSearch;
}

export function getSearchBar() {
  const searchParams = new URLSearchParams(store.searchParams);

  const options = {
    keywords: Object.keys(store.schema),
  };

  const searchBar = Array.from(searchParams.entries())
    .filter(([field, value]) => !field.startsWith(".") && field !== "_")
    .reduce((withEntry, [field, value]) => {
      return { ...withEntry, [field]: value };
    }, {});

  return parser.stringify(searchBar, options);
}

export async function onSearchBar(searchBar) {
  setStore(
    produce((state) => {
      state.searchBar = searchBar;
    }),
  );

  const options = {
    keywords: Object.keys(store.schema),
  };

  function objectize(q) {
    return typeof q === "string" ? { text: q } : q;
  }

  const searchBarOld = objectize(parser.parse(getSearchBar(), options));

  const searchBarNew = objectize(parser.parse(searchBar, options));

  // TODO: rename text to .text in fetsorn/search-query-parser
  const changes = diff(searchBarOld, searchBarNew, {
    cyclesFix: false,
    offsets: false,
  });

  // what if no change?
  // can there be no change on input? no, always returns field and value
  // can there be many changes? yes
  // in the most naive case we input a letter, and get that letter's
  // field and value
  // but what if the letter is plain text and must match multiple fields?
  const doSearch = batchUpdateSearchParams(changes);

  // no longer do search on change of search bar
  //if (doSearch) {
  //  await onSearch()
  //}
}

export async function onMindOpen(mind) {
  const schema = await readSchema(mind);

  const base = await getDefaultBase(schema);

  await onMindChange(`/${mind}`, `_=${base}`);
}

export async function onExport(mind) {
  setStore("loading", true);

  try {
    await exportMind(mind);
  } catch (e) {
    console.log(e);
  }

  setStore("loading", false);
}
