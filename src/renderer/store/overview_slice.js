import { API, manifestRoot } from "lib/api";
import { OverviewType } from "./types.js";

// pick a param to group data by
function getDefaultGroupBy(
  schema,
  data,
  searchParams
) {
  // fallback to groupBy param from the search query
  if (searchParams.has("groupBy")) {
    const groupBy = searchParams.get("groupBy");

    return groupBy;
  }

  let groupBy;

  const car = data[0] ?? {};

  // fallback to first date param present in data
  groupBy = Object.keys(schema).find((branch) => {
    return (
      schema[branch].type === "date" &&
      Object.prototype.hasOwnProperty.call(car, branch)
    );
  });

  // fallback to first param present in data
  if (!groupBy) {
    groupBy = Object.keys(schema).find((branch) => {
      return Object.prototype.hasOwnProperty.call(car, branch);
    });
  }

  // fallback to first date param present in schema
  if (!groupBy) {
    groupBy = Object.keys(schema).find(
      (branch) => schema[branch].type === "date"
    );
  }

  // fallback to first param present in schema
  if (!groupBy) {
    groupBy = Object.keys(schema)[0];
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
    queries[key] !== "" ? searchParams.set(key, queries[key]) : null
  );

  return searchParams;
}

function paramsToQueries(searchParams) {
  const searchParamsObject = Array.from(searchParams).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {}
  )

  const queries = Object.fromEntries(
    Object.entries(searchParamsObject).filter(
      ([key]) => key !== "groupBy" && key !== "overviewType"
    )
  );

  return queries
}

export const createOverviewSlice = (set, get) => ({
  schema: {},

  overview: [],

  isInitialized: false,

  repoRoute: undefined,

  base: undefined,

  initialize: async (repoRouteOriginal, search) => {
    const searchParams = new URLSearchParams(search);

    let repoRoute;

    if (searchParams.has("url")) {
      repoRoute = "/store/view";

      const api = new API(repoRoute);

      const url = searchParams.get("url");

      const token = searchParams.get("token") ?? "";

      searchParams.delete("url")

      searchParams.delete("token")

      try {
        await api.rimraf(repoRoute);
      } catch {
        // do nothing if nothing to rimraf
      }

      await api.clone(url, token);
    } else if (repoRouteOriginal === undefined) {
      repoRoute = "/store/root";

      if (__BUILD_MODE__ !== "server") {
        const apiRoot = new API("/store/root");

        await apiRoot.ensure(manifestRoot);
      }
    } else {
      repoRoute = `/repos/${repoRouteOriginal}`;
    }

    const api = new API(repoRoute);

    const queries = paramsToQueries(searchParams);

    const overviewTypeParam = searchParams.get(
      "overviewType"
    );

    const overviewType = overviewTypeParam
      ? OverviewType[overviewTypeParam]
      : get().overviewType;

    const groupBy = searchParams.get(
      "groupBy"
    ) ?? "";

    const schema = JSON.parse(await api.readFile("metadir.json"));

    const base = Object.keys(schema).find((branch) => !Object.prototype.hasOwnProperty.call(schema[branch], 'trunk'))

    set({ schema, base, queries, overviewType, groupBy, isInitialized: true, repoRoute })
  },

  onQueries: async () => {
    if (get().isInitialized) {
      const api = new API(get().repoRoute);

      const schema = JSON.parse(await api.readFile("metadir.json"));

      const base = Object.prototype.hasOwnProperty.call(schema, get().groupBy)
        ? get().base
        : Object.keys(schema).find((branch) => !Object.prototype.hasOwnProperty.call(schema[branch], 'trunk'))

      const searchParams = queriesToParams(get().queries);

      searchParams.set('|', base);

      const overview = await api.select(searchParams);

      const groupBy = Object.prototype.hasOwnProperty.call(schema, get().groupBy)
        ? get().groupBy
        : getDefaultGroupBy(schema, overview, searchParams);

      set({ overview, base, schema, groupBy })
    }
  },

  onChangeBase: async (base) => {
    const searchParams = queriesToParams(get().queries);

    set({ base });

    searchParams.set('|', base);

    const api = new API(get().repoRoute);

    const overview = await api.select(searchParams);

    set({ overview })
  },

  setRepoRoute: (repoRoute) => set({ repoRoute, queries: {}, entry: undefined })
})
