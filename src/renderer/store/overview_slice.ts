import {
  ensureRoot,
  fetchSchema,
  getDefaultGroupBy,
  searchRepo,
  cloneRepo,
} from "../api";
import { OverviewSlice, OverviewType } from "./types";

export function queriesToParams(queries: any) {
  const searchParams = new URLSearchParams();

  Object.keys(queries).map((key) =>
    queries[key] !== "" ? searchParams.set(key, queries[key]) : null
  );

  return searchParams;
}

function paramsToQueries(searchParams: URLSearchParams) {
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

export const createOverviewSlice: OverviewSlice = (set, get) => ({
  schema: {},

  overview: [],

  isInitialized: false,

  repoRoute: undefined,

  base: undefined,

  initialize: async (repoRouteOriginal: any, search: any) => {
    const searchParams = new URLSearchParams(search);

    let repoRoute;

    if (searchParams.has("url")) {
      repoRoute = "store/view";

      const url = searchParams.get("url");

      const token = searchParams.get("token") ?? "";

      searchParams.delete("url")

      searchParams.delete("token")

      await cloneRepo(url, token);
    } else if (repoRouteOriginal === undefined) {
      repoRoute = "store/root";

      if (__BUILD_MODE__ !== "server") {
        await ensureRoot();
      }
    } else {
      repoRoute = `repos/${repoRouteOriginal}`;
    }

    const queries = paramsToQueries(searchParams);

    const overviewTypeParam = searchParams.get(
      "overviewType"
    ) as keyof typeof OverviewType;

    const overviewType = overviewTypeParam
      ? OverviewType[overviewTypeParam]
      : get().overviewType;

    const groupBy = searchParams.get(
      "groupBy"
    ) ?? "";

    const schema = await fetchSchema(repoRoute);

    const base = Object.keys(schema).find((prop) => !Object.prototype.hasOwnProperty.call(schema[prop], 'trunk'))

    set({ schema, base, queries, overviewType, groupBy, isInitialized: true, repoRoute })
  },

  onQueries: async () => {
    if (get().isInitialized) {
      const schema = await fetchSchema(get().repoRoute);

      const base = Object.prototype.hasOwnProperty.call(schema, get().groupBy)
        ? get().base
        : Object.keys(schema).find((prop) => !Object.prototype.hasOwnProperty.call(schema[prop], 'trunk'))

      const searchParams = queriesToParams(get().queries);

      const overview = await searchRepo(get().repoRoute, searchParams, base);

      const groupBy = Object.prototype.hasOwnProperty.call(schema, get().groupBy)
        ? get().groupBy
        : getDefaultGroupBy(schema, overview, searchParams);

      set({ overview, base, schema, groupBy })
    }
  },

  onChangeBase: async (base: string) => {
    const searchParams = queriesToParams(get().queries);

    set({ base })

    const overview = await searchRepo(get().repoRoute, searchParams, base);

    set({ overview })
  },

  setRepoRoute: (repoRoute: string) => set({ repoRoute, queries: {}, entry: undefined })
})
