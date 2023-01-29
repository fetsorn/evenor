import {
  searchRepo,
} from "../api";
import { FilterSlice, OverviewType } from "./types";

function paramsToQueries(searchParams: URLSearchParams) {
  return Array.from(searchParams).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {}
  );
}

function queriesToParams(params: any) {
  const searchParams = new URLSearchParams();

  Object.keys(params).map((key) =>
    params[key] !== "" ? searchParams.set(key, params[key]) : null
  );

  return searchParams;
}

function setQueriesLocation(queriesNew: any, navigate: any) {
  const searchParams = queriesToParams(queriesNew);

  const search = "?" + searchParams.toString();

  navigate({
    pathname: location.pathname,
    search,
  });

  return search;
}

export const createFilterSlice: FilterSlice = (set, get) => ({
  queries: {},

  groupBy: undefined,

  overviewType: OverviewType.itinerary,

  onChangeGroupBy: (navigate: any, search: any, groupByNew: string) => set((state) => {
    const groupByProp =
        Object.keys(state.schema).find((p) => state.schema[p].label === groupByNew) ??
        groupByNew;

    const searchParams = new URLSearchParams(location.search);

    searchParams.set("groupBy", groupByProp);

    navigate({
      pathname: location.pathname,
      search: "?" + searchParams.toString(),
    });

    return {}
  }),

  onChangeOverviewType: (navigate: any, search: any, overviewTypeNew: string) => {
    const searchParams = new URLSearchParams(search);

    searchParams.set("overviewType", overviewTypeNew);

    navigate({
      pathname: location.pathname,
      search: "?" + searchParams.toString(),
    });
  },

  onQueryAdd: async (navigate: any, repoRoute: any, selected: string, searched: string) => {
    if (searched) {
      const queriesNew = { ...get().queries, [selected]: searched };

      const searchString = setQueriesLocation(queriesNew, navigate);

      const overview = await searchRepo(repoRoute, searchString);

      set({ overview })
    }
  },

  onQueryRemove: async (navigate: any, repoRoute: any, removed: string) => {
    const queriesNew: any = { ...get().queries };

    delete queriesNew[removed];

    const searchString = setQueriesLocation(queriesNew, navigate);

    const overview = await searchRepo(repoRoute, searchString);

    set({ overview })
  },

  onLocationFilter: (search: any) => {
    const searchParams = new URLSearchParams(search);

    const queriesNew = paramsToQueries(searchParams);

    const queries = Object.fromEntries(
      Object.entries(queriesNew).filter(
        ([key]) => key !== "groupBy" && key !== "overviewType"
      )
    );

    set({ queries })
  },
})
