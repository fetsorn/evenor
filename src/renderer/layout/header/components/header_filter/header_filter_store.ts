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

function setQueriesLocation(queriesNew: any, navigate: any) {
  const searchParams = queriesToParams(queriesNew);

  const search = "?" + searchParams.toString();

  navigate({
    pathname: location.pathname,
    search,
  });

  return search;
}

interface State {
  queries: any
  selected: any
  searched: any
  onQueryAdd: (navigate: any, repoRoute: any, onChangeQuery: any) => Promise<void>
  onQueryRemove: (navigate: any, repoRoute: any, onChangeQuery: any, removed: string) => Promise<void>
  onChangeSelected: (selected: string) => void
  onChangeSearched: (searched: string) => void
  onLocation: (search: any) => void
}

export const useFilterStore = create<State>((set, get) => ({
  queries: {},

  selected: "",

  searched: "",

  onQueryAdd: async (navigate: any, repoRoute: any, onChangeQuery: any) => {
    if (get().searched) {
      const queriesNew = { ...get().queries, [get().selected]: get().searched };

      const searchString = setQueriesLocation(queriesNew, navigate);

      await onChangeQuery(repoRoute, searchString);

      set({searched: ""})
    }
  },

  onQueryRemove: async (navigate: any, repoRoute: any, onChangeQuery: any, removed: string) => {
    const queriesNew: any = { ...get().queries };

    delete queriesNew[removed];

    const searchString = setQueriesLocation(queriesNew, navigate);

    await onChangeQuery(repoRoute, searchString);

    set({searched: ""})
  },

  onChangeSelected: (selected: string) => set({selected}),

  onChangeSearched: (searched: string) => set({searched}),

  onLocation: (search: any) => {
    const searchParams = new URLSearchParams(search);

    const queriesNew = paramsToQueries(searchParams);

    const queries = Object.fromEntries(
      Object.entries(queriesNew).filter(
        ([key]) => key !== "groupBy" && key !== "overviewType"
      )
    );

    set({ queries })
  },
}))
