import { create } from 'zustand'

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

function setQueriesLocation(queriesNew: any) {
  const searchParams = queriesToParams(queriesNew);

  const search = "?" + searchParams.toString();

  /* navigate({
     *   pathname: location.pathname,
     *   search,
     * }); */

  return search;
}

interface State {
  queries: any
  selected: any
  searched: any
  onQueryAdd: (repoRoute: any, onChangeQuery: any) => Promise<void>
  onQueryRemove: (repoRoute: any, onChangeQuery: any, removed: string) => Promise<void>
  onChangeSelected: (selected: string) => void
  onChangeSearched: (searched: string) => void
  onLocation: () => void
}

export const useFilterStore = create<State>((set, get) => ({
  queries: {},

  selected: "",

  searched: "",

  onQueryAdd: async (repoRoute: any, onChangeQuery: any) => {
    if (get().searched) {
      const queriesNew = { ...get().queries, [get().selected]: get().searched };

      const searchString = setQueriesLocation(queriesNew);

      await onChangeQuery(repoRoute, searchString);

      set({searched: ""})
    }
  },

  onQueryRemove: async (repoRoute: any, onChangeQuery: any, removed: string) => {
    const queriesNew: any = { ...get().queries };

    delete queriesNew[removed];

    const searchString = setQueriesLocation(queriesNew);

    await onChangeQuery(repoRoute, searchString);

    set({searched: ""})
  },

  onChangeSelected: (selected: string) => set({selected}),

  onChangeSearched: (searched: string) => set({searched}),

  onLocation: () => {
    const searchParams = new URLSearchParams(location.search);

    const queriesNew = paramsToQueries(searchParams);

    const queries = Object.fromEntries(
      Object.entries(queriesNew).filter(
        ([key]) => key !== "groupBy" && key !== "overviewType"
      )
    );

    set({ queries })
  },
}))
