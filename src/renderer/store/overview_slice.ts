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
    } else if (repoRoute === undefined) {
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

    set({ schema, queries, overviewType, groupBy, isInitialized: true, repoRoute })
  },

  onQueries: async () => {
    if (get().isInitialized) {
      const search = queriesToParams(get().queries).toString();

      const overview = await searchRepo(get().repoRoute, search);

      const groupBy = get().groupBy === ""
        ? getDefaultGroupBy(get().schema, overview, search)
        : get().groupBy;

      set({ overview, groupBy })
    }
  }
})
