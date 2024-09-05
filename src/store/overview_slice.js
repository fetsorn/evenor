import history from "history/hash";
import { digestMessage, enrichBranchRecords } from "@fetsorn/csvs-js";
import { API, schemaRoot, schemaToBranchRecords } from "../api/index.js";
import {
  getDefaultBase,
  getDefaultSortBy,
  setURL,
  loadRepoRecord,
} from "./bin.js";

export const createOverviewSlice = (set, get) => ({
  // structure of records in the current folder
  schema: schemaRoot,

  // currently viewed folder
  repo: { _: "repo", repo: "root" },

  // state of the search bar
  queries: { _: "repo" },

  // objects currently displayed in the overview
  records: [],

  // handler to interrupt a search stream
  abortPreviousStream: () => {},

  // bootstraps the state and reads the URL on application launch
  initialize: async () => {
    if (__BUILD_MODE__ === "server") {
      const api = new API("server");

      const schemaServer = await api.readSchema();

      const base = getDefaultBase(schemaServer);

      const sortBy = getDefaultSortBy(schemaServer, base, []);

      // read repo from working directory
      const recordServer = await loadRepoRecord("server", {
        _: "repo",
        repo: "server",
      });

      set({
        queries: { _: base, ".sortBy": sortBy },
        schema: schemaServer,
        repo: recordServer,
      });

      // run queries from the store
      await get().setQuery("", undefined);

      return;
    }

    // first initialize root
    const apiRoot = new API("root");

    await apiRoot.ensure();

    const branchRecords = schemaToBranchRecords(schemaRoot);

    for (const branchRecord of branchRecords) {
      await apiRoot.updateRecord(branchRecord);
    }

    await apiRoot.commit();

    // get all the queries from url here and feed them to setQuery
    const searchString = history.location.search;

    const searchParams = new URLSearchParams(searchString);

    const sortByURL = searchParams.get(".sortBy");

    function paramsToQueries(searchParamsSet) {
      const searchParamsObject = Array.from(searchParamsSet).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value }),
        {},
      );

      const queries = Object.fromEntries(
        Object.entries(searchParamsObject).filter(
          ([key]) => key !== "~" && key !== "-" && !key.startsWith("."),
        ),
      );

      return queries;
    }

    // convert to object, skip reserved fields
    const queries = paramsToQueries(searchParams);

    const repoRoute = history.location.pathname.replace("/", "");

    // if url specifies a remote, try to clone
    if (searchParams.has("~")) {
      // if uri specifies a remote
      // try to clone remote to store
      // where repo uuid is a digest of remote
      // and repo name is uri-encoded remote
      const remote = searchParams.get("~");

      const token = searchParams.get("-") ?? "";

      const repoUUIDRemote = await digestMessage(remote);

      try {
        const api = new API(repoUUIDRemote);

        // TODO rimraf the folder if it already exists

        await api.cloneView(remote, token);

        // TODO add new repo to root
        // TODO return a repo record

        const pathname = new URL(remote).pathname;

        // get repo name from remote
        const reponameClone = pathname.substring(pathname.lastIndexOf("/") + 1);

        const schemaClone = await api.readSchema();

        const [schemaRecordClone, ...metaRecordsClone] =
          schemaToBranchRecords(schemaClone);

        const branchRecordsClone = enrichBranchRecords(
          schemaRecordClone,
          metaRecordsClone,
        );

        const recordClone = {
          _: "repo",
          repo: repoUUIDRemote,
          reponame: reponameClone,
          branch: branchRecordsClone,
          remote_tag: {
            _: "remote_tag",
            remote_tag: "",
            remote_token: token,
            remote_url: remote,
          },
        };

        await get().onRecordUpdate({}, recordClone);

        const baseDefault = getDefaultBase(schemaClone);

        const base = queries._ ?? baseDefault;

        const sortByDefault = getDefaultSortBy(schemaClone, base, []);

        const sortBy = sortByURL ?? sortByDefault;

        set({
          queries: { ...queries, _: base, ".sortBy": sortBy },
          schema: schemaClone,
          repo: recordClone,
        });

        await get().setQuery("", undefined);

        return undefined;
      } catch (e) {
        // proceed to choose root repo uuid
        console.log(e);
      }
    }

    if (repoRoute !== "") {
      // if repo is in store, find uuid in root folder
      try {
        const [repo] = await apiRoot.select(
          new URLSearchParams(`?_=repo&reponame=${repoRoute}`),
        );

        const { repo: repoUUID } = repo;

        const api = new API(repoUUID);

        const schema = await api.readSchema();

        const baseDefault = getDefaultBase(schema);

        const base = queries._ ?? baseDefault;

        const sortByDefault = getDefaultSortBy(schema, base, []);

        const sortBy = sortByURL ?? sortByDefault;

        set({
          queries: { ...queries, _: base, ".sortBy": sortBy },
          schema,
          repo,
        });

        // run queries from the store
        await get().setQuery("", undefined);

        return;
      } catch {
        // proceed to set repo uuid as root
      }
    }

    const base = queries._ ?? "repo";

    const sortBy = sortByURL ?? getDefaultSortBy(schemaRoot, base, []);

    set({
      schema: schemaRoot,
      queries: { ...queries, _: base, ".sortBy": sortBy },
      repo: { _: "repo", repo: "root" },
    });

    // run queries from the store
    await get().setQuery("", undefined);

    return undefined;
  },

  // changes the currently viewed folder
  setRepoUUID: async (repoUUID, baseNew) => {
    set({ record: undefined });

    if (repoUUID === "root") {
      set({
        schema: schemaRoot,
        queries: { _: "repo", ".sortBy": "reponame" },
        repo: { _: "repo", repo: "root" },
      });

      // reset all queries
      await get().setQuery("", undefined);
    } else {
      const apiRoot = new API("root");

      // TODO handle errors
      const [repo] = await apiRoot.select(
        new URLSearchParams(`?_=repo&repo=${repoUUID}`),
      );

      const api = new API(repoUUID);

      const schema = await api.readSchema();

      const base = baseNew ?? getDefaultBase(schema);

      const sortBy = getDefaultSortBy(schema, base, []);

      set({ schema, queries: { _: base, ".sortBy": sortBy }, repo });

      // reset all queries
      await get().setQuery("", undefined);
    }
  },

  // changes the state of the search bar, runs a new search
  setQuery: async (queryField, queryValue) => {
    if (queryField === ".sortBy") {
      const {
        queries,
        repo: { repo: repoUUID, reponame },
      } = get();

      queries[queryField] = queryValue;

      set({ queries });

      setURL(queries, queries._, queryValue, repoUUID, reponame);

      return;
    }

    set({ records: [] });

    // abort previous search stream if it is running
    get().abortPreviousStream();

    let isAborted = false;

    const abortController = new AbortController();

    set({
      abortPreviousStream: async () => {
        isAborted = true;

        await abortController.abort();
      },
    });

    const { schema } = get();

    // if query field is undefined, delete queries
    if (queryField === undefined) {
      const { queries } = get();

      set({ queries: {} });
    } else if (queryField === "_") {
      const sortBy = getDefaultSortBy(schema, queryValue, []);

      set({ queries: { _: queryValue, ".sortBy": sortBy } });
      // if query field is defined, update queries
    } else if (queryField !== "") {
      const { queries } = get();

      // TODO: validate queryField
      // if query value is undefined, remove query field
      if (queryValue === undefined) {
        delete queries[queryField];
      } else {
        // if query value is defined, set query field
        queries[queryField] = queryValue;
      }

      set({ queries });
    }

    const {
      queries,
      repo: { repo: repoUUID, reponame },
    } = get();

    const searchParams = setURL(
      queries,
      queries._,
      queries[".sortBy"],
      repoUUID,
      reponame,
    );

    // remove all evenor-specific queries before passing searchParams to csvs
    searchParams.delete(".sortBy");

    const api = new API(repoUUID);

    const { strm: fromStrm, closeHandler } =
      await api.selectStream(searchParams);

    const toStrm = new WritableStream({
      write(chunk) {
        if (isAborted) {
          return;
        }

        const records = [...get().records, chunk];

        set({ records });
      },

      abort() {
        // stream interrupted
        // no need to await on the promise, closing api stream for cleanup
        closeHandler();
      },
    });

    // TODO: remove await here to free the main thread
    try {
      await fromStrm.pipeTo(toStrm, { signal: abortController.signal });
    } catch {
      // stream interrupted
    }
  },
});
