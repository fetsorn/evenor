import { createContext } from "solid-js";
import { createStore } from "solid-js/store";
import api from "../api/index.js";
import {
  foo,
  bar,
  baz,
  bux,
  qux,
  setURL,
  loadRepoRecord,
  saveRepoRecord,
  newUUID,
} from "./action.js";
import schemaRoot from "./schema_root.json";
import defaultRepoRecord from "./default_repo_record.json";

export const StoreContext = createContext();

export const [store, setStore] = createStore({
  abortPreviousStream: async () => {},
  queries: { _: "repo" },
  repo: { _: "repo", repo: "root" },
  schema: schemaRoot,
  record: undefined,
  records: [],
});

export async function onSearch(field, value) {
  // update queries in store
  const queries = baz(store.schema, store.queries, field, value);

  setStore({ queries });

  setURL(queries, queries._, value, store.repo.repo, store.repo.reponame);

  if (field === ".sortBy" || field === ".sortDirection") return;

  // stop previous stream
  await store.abortPreviousStream();

  // prepare a controller to stop the new stream
  let isAborted = false;

  const abortController = new AbortController();

  // solid store tries to call the function, so pass a factory here
  setStore("abortPreviousStream", () => () => {
    isAborted = true;

    abortController.abort();
  });

  // erase existing records
  setStore("records", []);

  // remove all evenor-specific queries before passing searchParams to csvs
  const {
    ".sortBy": omitSortBy,
    ".sortDirection": omitSortDirection,
    ...queriesWithoutSortBy
  } = queries;

  // prepare a new stream
  const { strm: fromStrm, closeHandler } = await api.selectStream(
    store.repo.repo,
    queriesWithoutSortBy,
  );

  const isHomeScreen = store.repo.repo === "root";

  const canSelectRepo = isHomeScreen;

  // create a stream that appends to store.records
  const toStrm = new WritableStream({
    async write(chunk) {
      if (isAborted) {
        return;
      }

      // when selecting a repo, load git state and schema from folder into the record
      const record = canSelectRepo ? await loadRepoRecord(chunk) : chunk;

      setStore("records", store.records.length, record);
    },

    abort() {
      // stream interrupted
      // no need to await on the promise, closing api stream for cleanup
      closeHandler();
    },
  });

  try {
    fromStrm.pipeTo(toStrm, { signal: abortController.signal });
  } catch (e) {
    // stream interrupted
    console.log(e);
  }
}

export async function onLaunch() {
  // ensure there is a root dataset
  await foo();

  const { schema, repo } = await bux();

  setStore("repo", repo);

  setStore("schema", schema);

  // get queries from url
  const queries = bar();

  setStore("queries", queries);

  // start a search stream
  await onSearch("", undefined);
}

export async function onRecordEdit(recordNew) {
  const isHomeScreen = store.repo.repo === "root";

  const isRepoBranch = store.queries._ === "repo";

  const isRepoRecord = isHomeScreen && isRepoBranch;

  const repoPartial = isRepoRecord ? defaultRepoRecord : {};

  const record = recordNew ?? {
    _: store.queries._,
    [store.queries._]: await newUUID(),
    ...repoPartial,
  };

  // TODO figure out a way to merge store without undefined
  setStore({ record: undefined });

  setStore({ record });
}

export async function onRecordSave(recordOld, recordNew) {
  const isHomeScreen = store.repo.repo === "root";

  const isRepoBranch = store.queries._ === "repo";

  const canSaveRepo = isHomeScreen && isRepoBranch;

  // won't save root/branch-trunk.csv to disk as it's read from repo/_-_.csv
  if (canSaveRepo) {
    const branches = recordNew["branch"].map(
      ({ trunk, ...branchWithoutTrunk }) => branchWithoutTrunk,
    );

    const recordPruned = { ...recordNew, branch: branches };

    await api.updateRecord(store.repo.repo, recordPruned);
  } else {
    await api.updateRecord(store.repo.repo, recordNew);
  }

  await api.commit(store.repo.repo);

  if (canSaveRepo) {
    await saveRepoRecord(recordNew);
  }

  const records = store.records
    .filter((r) => r[store.queries._] !== recordOld[store.queries._])
    .concat([recordNew]);

  setStore("records", records);

  setStore("record", undefined);
}

export async function onRecordWipe(record) {
  if (record === undefined) {
    setStore("record", undefined);

    return;
  }

  await api.deleteRecord(store.repo.repo, record);

  await api.commit(store.repo.repo);

  const records = store.records.filter(
    (r) => r[store.queries._] !== record[store.queries._],
  );

  setStore("records", records);
}

export async function onRepoChange(uuid, base) {
  const { repo, schema, queries } = await qux(uuid, base);

  setStore("repo", repo);

  setStore("schema", schema);

  setStore("queries", queries);

  // start a search stream
  await onSearch("", undefined);
}
