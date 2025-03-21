import { createContext } from "solid-js";
import { createStore } from "solid-js/store";
import { API } from "../api/index.js";
import {
  foo,
  bar,
  baz,
  schemaRoot,
  setURL,
  defaultRepoRecord,
  newUUID,
} from "./bin.js";

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
  const queries = baz(store.queries, field, value);

  setURL(queries, queries._, value, store.repo.repo, store.repo.reponame);

  setStore("queries", queries);

  // start a stream that appends to store.records
  setStore("records", []);

  const {
    schema,
    repo: { repo: repoUUID, reponame },
  } = store;

  store.abortPreviousStream();

  const api = new API(repoUUID);

  // remove all evenor-specific queries before passing searchParams to csvs
  const { ".sortBy": omit, ...queriesWithoutSortBy } = queries;

  const { strm: fromStrm, closeHandler } =
    await api.selectStream(queriesWithoutSortBy);

  const isHomeScreen = repoUUID === "root";

  const canSelectRepo = isHomeScreen;

  let isAborted = false;

  const abortController = new AbortController();

  setStore("abortPreviousStream", async () => {
    isAborted = true;

    await abortController.abort();
  });

  const toStrm = new WritableStream({
    async write(chunk) {
      if (isAborted) {
        return;
      }

      // when selecting a repo, load git state and schema from folder into the record
      const record = canSelectRepo ? await loadRepoRecord(chunk) : chunk;

      const records = [...store.records, record];

      setStore("records", records);
    },

    abort() {
      // stream interrupted
      // no need to await on the promise, closing api stream for cleanup
      closeHandler();
    },
  });

  // TODO: remove await here to free the main thread
  try {
    // await fromStrm.pipeTo(toStrm, { signal: abortController.signal });
    await fromStrm.pipeTo(toStrm);
  } catch (e) {
    // stream interrupted
    console.log(e);
  }
}

export async function onLaunch() {
  // ensure there is a root dataset
  await foo();

  // get queries from url
  const { queries, base, sortBy } = bar();

  setStore("schema", schemaRoot);

  setStore("queries", { ...queries, _: base, ".sortBy": sortBy });

  setStore("repo", { _: "repo", repo: "root" });

  // start a search stream
  await onSearch("", undefined);
}

export async function onRecordEdit(recordNew) {
  const {
    repo: { repo: repoUUID },
    queries: { _: base },
  } = store;

  const isHomeScreen = repoUUID === "root";

  const isRepoBranch = base === "repo";

  const isRepoRecord = isHomeScreen && isRepoBranch;

  const repoPartial = isRepoRecord ? defaultRepoRecord : {};

  const record = recordNew ?? {
    _: base,
    [base]: await newUUID(),
    ...repoPartial,
  };

  setStore("record", record);
}

export async function onRecordSave(recordOld, recordNew) {
  const api = new API(store.repo.repo);

  const isHomeScreen = repoUUID === "root";

  const isRepoBranch = base === "repo";

  const canSaveRepo = isHomeScreen && isRepoBranch;

  // won't save root/branch-trunk.csv to disk as it's read from repo/_-_.csv
  if (canSaveRepo) {
    const branches = record["branch"].map(
      ({ trunk, ...branchWithoutTrunk }) => branchWithoutTrunk,
    );

    const recordPruned = { ...record, branch: branches };

    await api.updateRecord(recordPruned);
  } else {
    await api.updateRecord(recordNew);
  }

  await api.commit();

  const records = store.records
    .filter((r) => r[base] !== recordOld[base])
    .concat([recordNew]);

  setStore("records", records);

  setStore("record", undefined);
}

export async function onRecordWipe(record) {
  if (record === undefined) {
    setStore("record", undefined);

    return;
  }

  const api = new API(store.repo.repo);

  await api.deleteRecord(record);

  await api.commit();

  const records = store.records.filter((r) => r[base] !== record[base]);

  setStore("records", records);
}

export async function onRepoChange(uuid) {
  setStore("repo", { _: repo, repo: uuid });
}

export { isTwig } from "./bin.js";
