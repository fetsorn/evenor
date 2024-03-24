import { API, schemaRoot } from "../api/index.js";

// pick a param to group data by
function getDefaultGroupBy(schema, data, searchParams) {
  // fallback to groupBy param from the search query
  if (searchParams.has(".group")) {
    const groupBy = searchParams.get(".group");

    return groupBy;
  }

  let groupBy;

  const car = data[0] ?? {};

  // fallback to first date param present in data
  groupBy = Object.keys(schema).find(
    (branch) =>
      schema[branch].task === "date" &&
      Object.prototype.hasOwnProperty.call(car, branch),
  );

  // fallback to first param present in data
  if (!groupBy) {
    groupBy = Object.keys(schema).find((branch) =>
      Object.prototype.hasOwnProperty.call(car, branch),
    );
  }

  // fallback to first date param present in schema
  if (!groupBy) {
    groupBy = Object.keys(schema).find(
      (branch) => schema[branch].task === "date",
    );
  }

  // fallback to first param present in schema
  if (!groupBy) {
    [groupBy] = Object.keys(schema);
  }

  // unreachable with a valid scheme
  if (!groupBy) {
    throw Error("failed to find default groupBy in the schema");
  }

  return groupBy;
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

  overview: [],

  isInitialized: false,

  isView: false,

  repoRoute: undefined,

  repoUUID: undefined,

  repoName: undefined,

  base: undefined,

  closeHandler: () => {},

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

    const groupBy = searchParams.get(".group") ?? undefined;

    const schema = await api.readSchema();

    const base = Object.keys(schema).find(
      (branch) =>
        !Object.prototype.hasOwnProperty.call(schema[branch], "trunk"),
    );

    set({
      schema,
      base,
      queries,
      groupBy,
      isView,
      isInitialized: true,
      repoUUID,
      repoName,
    });

    await get().updateOverview();
  },

  updateOverview: async () => {
    // close select stream if already running
    try {
      get().closeHandler();
    } catch {
      // do nothing
    }

    set({ closeHandler: () => {} });

    const { base, queries, repoUUID } = get();

    const api = new API(repoUUID);

    const schema = await api.readSchema();

    const searchParams = queriesToParams(queries);

    searchParams.set("_", base);

    const { strm: fromStrm, closeHandler } =
      await api.selectStream(searchParams);

    set({ closeHandler });

    const toStrm = new WritableStream({
      write(chunk) {
        const overview = [...get().overview, chunk];

        const schemaBase = Object.fromEntries(
          Object.entries(schema).filter(
            ([branch, info]) =>
              branch === base ||
              info.trunk === base ||
              schema[info.trunk]?.trunk === base,
          ),
        );

        const groupBy = Object.prototype.hasOwnProperty.call(
          schemaBase,
          queries[".group"],
        )
          ? queries[".group"]
          : getDefaultGroupBy(schemaBase, overview, searchParams);

        set({
          groupBy,
          queries,
          overview,
        });
      },

      abort(err) {
        console.error("Sink error:", err);
      },
    });

    await fromStrm.pipeTo(toStrm);

    set({ closeHandler: () => {} });
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

      const pathname = repoName === undefined ? "/" : `/${repoName}`;

      window.history.replaceState(
        null,
        null,
        `${pathname}?${searchParams.toString()}`,
      );

      set({
        base,
        schema,
        overview: [],
        queries,
      });

      await get().updateOverview();
    }
  },

  setRepoUUID: async (repoUUID) => {
    // close select stream if already running
    try {
      get().closeHandler();
    } catch {
      // do nothing
    }

    set({ closeHandler: () => {} });

    let repoName;

    if (repoUUID === "root" || get().isView) {
      // leave repoName as undefined
    } else {
      const api = new API("root");

      const searchParams = new URLSearchParams();

      searchParams.set("_", "reponame");

      searchParams.set("reponame", repoUUID);

      const [entry] = await api.select(searchParams);

      repoName = entry.reponame;
    }

    set({
      repoName,
      repoUUID,
      queries: {},
      entry: undefined,
    });
  },

  setRepoName: async (repoName) => {
    // close select stream if already running
    try {
      get().closeHandler();
    } catch {
      // do nothing
    }

    set({ closeHandler: () => {} });

    const api = new API("root");

    const searchParams = new URLSearchParams();

    searchParams.set("_", "reponame");

    searchParams.set("reponame", repoName);

    const [entry] = await api.select(searchParams);

    if (entry === undefined) {
      return;
    }

    const repoUUID = entry.UUID;

    set({
      repoName,
      repoUUID,
      queries: {},
      entry: undefined,
    });
  },

  setGroupBy: async (groupBy) => {
    set({
      groupBy,
    });
  },

  setBase: async (base) => {
    set({ base, overview: [] });

    await get().updateOverview();
  },
});
