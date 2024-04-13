import { API, schemaRoot } from "../api/index.js";
import { queriesToParams } from "./bin.js";
import { WritableStream as WritableStreamPolyfill } from "web-streams-polyfill";
import { schemaToBranchRecords, paramsToQueries, getDefaultBase, getDefaultSortBy } from "./bin.js";
import history from 'history/hash';
import { digestMessage } from "@fetsorn/csvs-js";

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

    const base = searchParams.get("_")

    const sortBy = searchParams.get(".sortBy")

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
        await get().setRepoUUID(repoUUID)

        set({ queries, base, sortBy })

        // run queries from the store
        await get().setQuery("", undefined);

        return undefined
      } catch {
        // proceed to choose root repo uuid
      }
    }

    const repoRoute = history.location.pathname.replace("/", "");

    if (repoRoute !== "") {
      // if repo is in root, set
      try {
        const [{ repo }] = await apiRoot.select(
          new URLSearchParams(`?_=repo&reponame=${repoRoute}`)
        );

        await get().setRepoUUID(repo)

        set({ queries, base, sortBy })

        // run queries from the store
        await get().setQuery("", undefined);

        return
      } catch {
        // proceed to set repo uuid as root
      }
    }

    await get().setRepoUUID("root")

    set({ queries, base, sortBy })

    // run queries from the store
    await get().setQuery("", undefined);

    return undefined
  },

  setBase: async (base) => {
    set({ base });

    // reset all queries
    await get().setQuery(undefined, undefined);
  },

  setSortBy: async (sortBy) => set({ sortBy }),

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
    const { queries } = get();

    // if query field is undefined, delete queries
    if (queryField === undefined) {
      set({ queries: {} })
      // if query field is empty, don't change queries
    } else if (queryField !== "") {
      // if query field is defined, update queries
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

    const { base, sortBy, repo: { repo: repoUUID, reponame } } = get();

    const searchParams = queriesToParams(queries);

    searchParams.set("_", base);

    if (sortBy) {
      searchParams.set(".sortBy", sortBy);
    }

    const pathname = repoUUID === "root" ? "#" : `#/${reponame}`;

    const searchStringNew = searchParams.toString();

    const urlNew = `${pathname}?${searchStringNew}`;

    window.history.replaceState(null, null, urlNew);

    const api = new API(repoUUID);

    const { strm: fromStrm, closeHandler } =
      await api.selectStream(searchParams);

    const toStrm = new WritableStream({
      write(chunk) {
        if (isAborted) {
          return;
        }

        const records = [...get().records, chunk];

        // reset sort here
        try {
          const sortByNew = sortBy ?? getDefaultSortBy(base, records, searchParams);

          set({ sortBy: sortByNew });
        } catch {
        }

        set({
          records,
        });
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
