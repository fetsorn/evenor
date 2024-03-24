import { API, schemaRoot } from "../api/index.js";

// pick a param to group data by
function getDefaultSortBy(schema, data, searchParams) {
  // fallback to sortBy param from the search query
  if (searchParams.has(".sort")) {
    const sortBy = searchParams.get(".sort");

    return sortBy;
  }

  let sortBy;

  const car = data[0] ?? {};

  // fallback to first date param present in data
  sortBy = Object.keys(schema).find(
    (branch) =>
      schema[branch].task === "date" &&
      Object.prototype.hasOwnProperty.call(car, branch),
  );

  // fallback to first param present in data
  if (!sortBy) {
    sortBy = Object.keys(schema).find((branch) =>
      Object.prototype.hasOwnProperty.call(car, branch),
    );
  }

  // fallback to first date param present in schema
  if (!sortBy) {
    sortBy = Object.keys(schema).find(
      (branch) => schema[branch].task === "date",
    );
  }

  // fallback to first param present in schema
  if (!sortBy) {
    [sortBy] = Object.keys(schema);
  }

  // unreachable with a valid scheme
  if (!sortBy) {
    throw Error("failed to find default sortBy in the schema");
  }

  return sortBy;
}

export function queriesToParams(queries) {
  const searchParams = new URLSearchParams();

  Object.keys(queries).map((key) =>
    queries[key] === "" ? null : searchParams.set(key, queries[key]),
  );

  return searchParams;
}

function paramsToQueries(searchParams) {
  const searchParamsObject = Array.from(searchParams).reduce(
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

export const createOverviewSlice = (set, get) => ({
  schema: {},

  records: [],

  isInitialized: false,

  isView: false,

  repoRoute: undefined,

  repoUUID: undefined,

  repoName: undefined,

  base: undefined,

  abortPreviousStream: () => {},

  initialize: async (repoRoute, search) => {
    const searchParams = new URLSearchParams(search);

    let repoUUID;

    let repoName;

    let isView = false;

    if (searchParams.has("~")) {
      // if uri specifies a remote
      // try to clone remote to store
      // where repo uuid is a digest of remote
      // and repo name is uri-encoded remote
      const remote = searchParams.get("~");

      const token = searchParams.get("-") ?? "";

      const { digestMessage } = await import("@fetsorn/csvs-js");

      repoUUID = await digestMessage(remote);

      repoName = encodeURIComponent(remote);

      isView = true;

      const api = new API(repoUUID);

      await api.cloneView(remote, token);
    } else if (repoRoute === undefined) {
      repoUUID = "root";

      // eslint-disable-next-line
      if (__BUILD_MODE__ !== "server") {
        const apiRoot = new API("root");

        await apiRoot.ensure(schemaRoot);
      }
    } else {
      repoName = repoRoute;

      const apiRoot = new API("root");

      const searchParamsReponame = new URLSearchParams();

      searchParamsReponame.set("_", "reponame");

      searchParamsReponame.set("reponame", repoName);

      try {
        const [{ UUID }] = await apiRoot.select(searchParamsReponame);

        repoUUID = UUID;
      } catch {
        // if repoRoute is not in root database
        // try to decode repoRoute as a view url
        // and set uuid to a digest of repoRoute
        const remote = repoRoute;

        const { digestMessage } = await import("@fetsorn/csvs-js");

        repoUUID = digestMessage(remote);

        repoName = encodeURIComponent(remote);

        isView = true;
      }
    }

    const api = new API(repoUUID);

    const debugMessage = await api.helloWorld("Hello");

    console.log(debugMessage);

    const queries = paramsToQueries(searchParams);

    const sortBy = searchParams.get(".sort") ?? undefined;

    const schema = await api.readSchema();

    const base = Object.keys(schema).find(
      (branch) =>
        !Object.prototype.hasOwnProperty.call(schema[branch], "trunk"),
    );

    set({
      schema,
      base,
      queries,
      sortBy,
      isView,
      isInitialized: true,
      repoUUID,
      repoName,
    });

    await get().updateOverview();
  },

  updateOverview: async () => {
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

    const { base, queries, repoUUID } = get();

    const api = new API(repoUUID);

    const schema = await api.readSchema();

    const searchParams = queriesToParams(queries);

    searchParams.set("_", base);

    const { strm: fromStrm, closeHandler } =
      await api.selectStream(searchParams);

    const toStrm = new WritableStream({
      write(chunk) {
        if (isAborted) {
          return;
        }

        const records = [...get().records, chunk];

        const schemaBase = Object.fromEntries(
          Object.entries(schema).filter(
            ([branch, info]) =>
              branch === base ||
              info.trunk === base ||
              schema[info.trunk]?.trunk === base,
          ),
        );

        const sortBy = Object.prototype.hasOwnProperty.call(
          schemaBase,
          queries[".sort"],
        )
          ? queries[".sort"]
          : getDefaultSortBy(schemaBase, records, searchParams);

        set({
          sortBy,
          queries,
          records,
        });
      },

      abort() {
        // stream interrupted
        // no need to await on the promise, closing api stream for cleanup
        closeHandler();
      },
    });

    try {
      await fromStrm.pipeTo(toStrm, { signal: abort_controller.signal });
    } catch {
      // stream interrupted
    }
  },

  onQueries: async () => {
    if (get().isInitialized) {
      const { queries, repoName } = get();

      const api = new API(get().repoUUID);

      const schema = await api.readSchema();

      const base = Object.prototype.hasOwnProperty.call(schema, queries._)
        ? queries._
        : Object.keys(schema).find(
            (branch) =>
              !Object.prototype.hasOwnProperty.call(schema[branch], "trunk"),
          );

      const searchParams = queriesToParams(queries);

      const pathname = repoName === undefined ? "/" : `#/${repoName}`;

      window.history.replaceState(
        null,
        null,
        `${pathname}${
          searchParams.toString() == "" ? "" : `?${searchParams.toString()}`
        }`,
      );

      set({
        base,
        schema,
        records: [],
        queries,
      });

      await get().updateOverview();
    }
  },

  setRepoUUID: async (repoUUID) => {
    // abort previous search stream if it is running
    get().abortPreviousStream();

    let repoName;

    if (repoUUID === "root" || get().isView) {
      // leave repoName as undefined
    } else {
      const api = new API("root");

      const searchParams = new URLSearchParams();

      searchParams.set("_", "reponame");

      searchParams.set("reponame", repoUUID);

      const [record] = await api.select(searchParams);

      repoName = record.reponame;
    }

    set({
      repoName,
      repoUUID,
      queries: {},
      record: undefined,
    });

    await get().onQueries();
  },

  setRepoName: async (repoName) => {
    // abort previous search stream if it is running
    get().abortPreviousStream();

    const api = new API("root");

    const searchParams = new URLSearchParams();

    searchParams.set("_", "reponame");

    searchParams.set("reponame", repoName);

    const [record] = await api.select(searchParams);

    if (record === undefined) {
      return;
    }

    const repoUUID = record.UUID;

    set({
      repoName,
      repoUUID,
      queries: {},
      record: undefined,
    });

    await get().onQueries();
  },

  setSortBy: async (sortBy) => {
    set({
      sortBy,
    });
  },

  setBase: async (base) => {
    set({ base, records: [] });

    await get().updateOverview();
  },
});
