import { createContext } from "solid-js";
import parser from "search-query-parser";
import diff from "microdiff";
import { searchParamsToQuery } from "@/store/pure.js";
import { createStore, produce } from "solid-js/store";
import { createRecord, selectStream, learn } from "@/store/impure.js";
import { push, pull, createRoot, readSchema } from "@/store/record.js";
import { clone } from "@/store/open.js";
import { saveRecord, wipeRecord, changeMind } from "@/store/action.js";
import { sortCallback, changeSearchParams, makeURL } from "@/store/pure.js";
import schemaRoot from "@/store/default_root_schema.json";

export const StoreContext = createContext();

export const [store, setStore] = createStore({
  abortPreviousStream: async () => {},
  searchParams: "_=mind",
  mind: { _: "mind", mind: "root", name: "minds" },
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
export function getSortedRecords() {
  const sortBy = new URLSearchParams(store.searchParams).get(".sortBy");

  const sortDirection = new URLSearchParams(store.searchParams).get(
    ".sortDirection",
  );

  const records = store.records.toSorted(sortCallback(sortBy, sortDirection));

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
    store.records,
    record,
  );

  setStore(
    produce((state) => {
      state.records = records;
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
  setStore("records", store.records.length, record);
}

export async function onSort(field, value) {
  updateSearchParams(field, value);

  setStore(
    produce((state) => {
      state.records = getSortedRecords();
    }),
  );
}

export async function onBase(value) {
  updateSearchParams("_", value);

  //await onSearch()
}

/**
 * This
 * @name onSearch
 * @export function
 */
export async function onSearch() {
  setStore("loading", true);

  const url = makeURL(new URLSearchParams(store.searchParams), store.mind.mind);

  window.history.replaceState(null, null, url);

  // TODO: reset loading on the end of the stream
  try {
    const { abortPreviousStream, startStream } = await selectStream(
      store.schema,
      store.mind.mind,
      appendRecord,
      new URLSearchParams(store.searchParams),
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

  setStore("loading", false);
}

// here to reproduce the ev.error heisenbug
export async function onSearchError(m) {
  setStore("loading", true);

  const { findMind } = await import("@/api/browser/io.js");
  const csvs = await import("@fetsorn/csvs-js");
  const { fs } = await import("@/api/browser/lightningfs.js");

  //onMindChange(`/${props.item.mind}`, `_=${item["branch"]}`)
  const { mind, schema, searchParams } = await changeMind(`/${m}`, "_=event");

  setStore(
    produce((state) => {
      state.mind = mind;
      state.schema = schema;
      state.searchParams = searchParams.toString();
    }),
  );

  // remove all evenor-specific searchParams before passing to csvs
  const searchParamsWithoutCustom = new URLSearchParams(
    Array.from(searchParams.entries()).filter(([key]) => !key.startsWith(".")),
  );

  const query = searchParamsToQuery(store.schema, searchParamsWithoutCustom);

  const queryStream = new ReadableStream({
    start(controller) {
      controller.enqueue(query);

      controller.close();
    },
  });

  const dir = await findMind(store.mind.mind);

  const selectStream = csvs.selectRecordStream({
    fs,
    dir,
  });

  const fromStrm = queryStream.pipeThrough(selectStream);

  // create a stream that appends to records
  const toStrm = new WritableStream({
    async write(chunk) {
      appendRecord(chunk);
    },
  });

  try {
    await fromStrm.pipeTo(toStrm);
  } catch (e) {
    console.error(e);
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
      state.records = [];
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
 * This
 * @name onClone
 * @export function
 * @param {String} mind -
 * @param {String} name -
 * @param {String} remoteUrl -
 * @param {String} remoteToken -
 */
export async function onClone(mind, name, remoteUrl, remoteToken) {
  setStore("loading", true);

  try {
    const { mind: mindRecord } = await clone(
      mind,
      name,
      remoteUrl,
      remoteToken,
    );

    setStore(
      produce((state) => {
        state.record = mindRecord;
      }),
    );
  } catch (e) {
    console.log("clone failed", e);
    // do nothing
  }

  setStore("loading", false);
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

export async function getDefaultBase(mind) {
  // read schema
  const schema = await readSchema(mind);

  // return some branch of schema
  const roots = Object.keys(schema).filter(
    (b) => b !== "branch" && schema[b].trunks.length == 0,
  );

  const base = roots.reduce((withRoot, root) => {
    if (schema[root].leaves.length > schema[withRoot].leaves.length) {
      return root;
    } else {
      return withRoot;
    }
  }, roots[0]);

  return base;
}

export async function onLearn(source, query, target) {
  setStore("loading", true);

  await learn(source, query, target);

  setStore("loading", false);
}
