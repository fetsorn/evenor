import history from 'history/hash';
import { WritableStream as WritableStreamPolyfill } from "web-streams-polyfill";
import { digestMessage } from "@fetsorn/csvs-js";
import { API, schemaRoot, schemaToBranchRecords } from "../api/index.js";
import { getDefaultBase, getDefaultSortBy } from "./bin.js";

if (!self.WritableStream) {
  self.WritableStream = WritableStreamPolyfill;
}

export const createOverviewSlice = (set, get) => ({
  queries: {},

  base: "repo",

  sortBy: "reponame",

  schema: schemaRoot,

  records: [],

  repo: { _: "repo", repo: "root" },

  abortPreviousStream: () => {},

  // TODO: refactor this away somehow
  initialize: async () => {
    // first initialize root
    const apiRoot = new API("root");

    await apiRoot.ensure();

    const records = schemaToBranchRecords(schemaRoot);

    for (const record of records) {
      await apiRoot.updateRecord(record, []);
    }

    await apiRoot.commit();

    // get all the queries from url here and feed them to setQuery
    const searchString = history.location.search;

    const searchParams = new URLSearchParams(searchString);

    const baseURL = searchParams.get("_")

    const sortByURL = searchParams.get(".sortBy")

    function paramsToQueries(searchParamsSet) {
      const searchParamsObject = Array.from(searchParamsSet).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value }),
        {},
      );

      const queries = Object.fromEntries(
        Object.entries(searchParamsObject).filter(
          ([key]) => key !== "_" && key !== "~" && key !== "-" && !key.startsWith("."),
        ),
      );

      return queries;
    }

    // convert to object, skip reserved fields
    const queries = paramsToQueries(searchParams);

    // if url specifies a remote, try to clone
    if (searchParams.has("~")) {
      // if uri specifies a remote
      // try to clone remote to store
      // where repo uuid is a digest of remote
      // and repo name is uri-encoded remote
      const remote = searchParams.get("~");

      const token = searchParams.get("-") ?? "";

      const repoUUID = await digestMessage(remote);

      try {
        const api = new API(repoUUID);

        await api.cloneView(remote, token);

        // set queries from
        const [{ repo }] = await apiRoot.select(
          new URLSearchParams(`?_=repo&reponame=${repoRoute}`)
        );

        const schema = await api.readSchema();

        const baseDefault = getDefaultBase(schema);

        set({ queries, base: baseURL ?? baseDefault, schema, repo })

        // run queries from the store
        await get().setQuery("", undefined);

        return undefined
      } catch {
        // proceed to choose root repo uuid
      }
    }

    const repoRoute = history.location.pathname.replace("/", "");

    if (repoRoute !== "") {
      // if repo is in store, find uuid in root dataset
      try {
        const [{ repo }] = await apiRoot.select(
          new URLSearchParams(`?_=repo&reponame=${repoRoute}`)
        );

        const api = new API(repoUUID);

        const schema = await api.readSchema();

        const baseDefault = getDefaultBase(schema);

        set({ queries, base: baseURL ?? baseDefault, schema, repo })

        // run queries from the store
        await get().setQuery("", undefined);

        return
      } catch {
        // proceed to set repo uuid as root
      }
    }

    set({
      schema: schemaRoot,
      base: baseURL ?? "repo",
      queries,
      repo: { _: "repo", repo: "root" }
    });

    // run queries from the store
    await get().setQuery("", undefined);

    return undefined
  },

  setRepoUUID: async (repoUUID) => {
    // abort previous search stream if it is running
    get().abortPreviousStream();

    set({ record: undefined });

    if (repoUUID === "root") {
      set({
        schema: schemaRoot,
        base: "repo",
        sortBy: undefined,
        repo: { _: "repo", repo: "root" }
      });
    } else {
      const apiRoot = new API("root");

      // TODO handle errors
      const [repo] = await apiRoot.select(new URLSearchParams(`?_=repo&repo=${repoUUID}`));

      const api = new API(repoUUID);

      const schema = await api.readSchema();

      const base = getDefaultBase(schema);

      set({ schema, base, sortBy: undefined, repo });
    }

    // reset all queries
    await get().setQuery(undefined, undefined);
  },

  setQuery: async (queryField, queryValue) => {
    if (queryField === ".sortBy") {
      set({ sortBy: queryValue });

      return
    }

    set({ records: [] })

    // abort previous search stream if it is running
    get().abortPreviousStream();

    let isAborted = false;

    const abort_controller = new AbortController();

    set({
      abortPreviousStream: async () => {
        isAborted = true;

        await abort_controller.abort();
      },
    });

    const { schema } = get();

    // if query field is undefined, delete queries
    if (queryField === undefined) {
      set({ queries: {} })
    } else if (queryField === "_") {
      const sortBy = getDefaultSortBy(schema, queryValue, [])

      set({ base: queryValue, sortBy, queries: {} });
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

    const { queries, base, sortBy, repo: { repo: repoUUID, reponame } } = get();

    function queriesToParams(queriesObject) {
      const searchParams = new URLSearchParams();

      Object.keys(queriesObject).map((key) =>
        queriesObject[key] === "" ? null : searchParams.set(key, queriesObject[key]),
      );

      return searchParams;
    }

    const searchParams = queriesToParams(queries);

    searchParams.set("_", base);

    if (sortBy) {
      searchParams.set(".sortBy", sortBy);
    }

    const pathname = repoUUID === "root" ? "#" : `#/${reponame}`;

    const searchStringNew = searchParams.toString();

    const urlNew = `${pathname}?${searchStringNew}`;

    window.history.replaceState(null, null, urlNew);

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
      await fromStrm.pipeTo(toStrm, { signal: abort_controller.signal });
    } catch {
      // stream interrupted
    }
  },
});
