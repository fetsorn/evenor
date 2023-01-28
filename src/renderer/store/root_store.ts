import { create } from 'zustand'
import { ensureRoot } from "../dispensers";
import {
  searchRepo,
  fetchSchema,
  uploadFile,
  updateOverview,
  createEntry,
  editEntry,
  deleteEntry,
  addProp,
  deepClone,
  getDefaultGroupBy,
} from ".";

export enum OverviewType {
    itinerary = "itinerary",
    graph = "graph",
}

interface State {
  entry: any
  index: any
  group: any
  groupBy: any
  schema: any
  overview: any
  isEdit: boolean
  isBatch: boolean
  overviewType: OverviewType
  isLoaded: boolean
  queries: any
  selected: string
  searched: string
  onBatchSelect: () => void
  onEntrySelect: (entryNew: any, indexNew: any, groupNew: any) => void
  onEntryCreate: any
  onSave: (repoRoute: any) => Promise<void>
  onEdit: () => void
  onRevert: () => void
  onDelete: any
  onClose: () => void
  onAddProp: (label: string) => Promise<void>
  onInputChange: (label: string, value: string) => void
  onInputUpload: (repoRoute: any, label: string, file: any) => void
  onInputRemove: (label: string) => void
  onInputUploadElectron: (repoRoute: string, label: string) => void
  onChangeGroupBy: (navigate: any, search: any, groupByNew: string) => void
  onChangeOverviewType: (navigate: any, search: any, overviewTypeNew: string) => void
  onChangeQuery: (repoRoute: any, searchString: string) => Promise<void>
  onLocationChange: (search: any) => void
  onFirstRender: (repoRoute: any, search: any) => Promise<void>
  onQueryAdd: (navigate: any, repoRoute: any, onChangeQuery: any) => Promise<void>
  onQueryRemove: (navigate: any, repoRoute: any, onChangeQuery: any, removed: string) => Promise<void>
  onChangeSelected: (selected: string) => void,
  onChangeSearched: (searched: string) => void,
  onLocationFilter: (search: any) => void
}

export const useStore = create<State>((set, get) => ({
  entry: undefined,

  index: undefined,

  group: undefined,

  groupBy: undefined,

  schema: {},

  overview: [],

  isEdit: false,

  isBatch: false,

  overviewType: OverviewType.itinerary,

  isLoaded: false,

  queries: {},

  selected: "",

  searched: "",

  onFirstRender: async (repoRoute: any, search: any) => {
    if (repoRoute === undefined && __BUILD_MODE__ !== "server") {
      await ensureRoot();
    }

    const schema = await fetchSchema(repoRoute);

    const overview = await searchRepo(repoRoute, search);

    const groupBy = getDefaultGroupBy(
      schema,
      overview,
      search
    );

    set({schema, overview, groupBy, isLoaded: true})
  },

  onLocationChange: (search: any) => set((state) => {
    const searchParams = new URLSearchParams(search);

    const overviewTypeParam = searchParams.get(
      "overviewType"
    ) as keyof typeof OverviewType;

    const overviewType = overviewTypeParam ? OverviewType[overviewTypeParam] : state.overviewType;

    const groupBy = state.isLoaded ? getDefaultGroupBy(state.schema, state.overview, search) : state.groupBy;

    return { overviewType, groupBy }
  }),

  onBatchSelect: () => set({ isBatch: true }),

  onEntrySelect: (entryNew: any, indexNew: any, groupNew: any) => set({ entry: entryNew, index: indexNew, group: groupNew }),

  onEntryCreate: async (index: string) => {
    const entry = await createEntry();

    set({ index, isEdit: true, entry })
  },

  onSave: async (repoRoute: any) => {
    await editEntry(repoRoute, deepClone(get().entry));

    const overview = updateOverview(get().overview, deepClone(get().entry));

    set({ overview, isEdit: false })

    document.getElementById(get().entry.UUID).scrollIntoView();
  },

  onEdit: () => set({ isEdit: true }),

  onRevert: () => set({ isEdit: false }),

  onDelete: async (repoRoute: any) => {
    const overview = await deleteEntry(repoRoute, get().overview, get().entry);

    set({ overview, entry: undefined });
  },

  onClose: () => set({ entry: undefined }),

  onAddProp: async (label: string) => {
    const entry = await addProp(get().schema, deepClone(get().entry), label);

    set({ entry })
  },

  onInputChange: (label: string, value: string) => set((state) => {
    const entry = deepClone(state.entry);

    entry[label] = value;

    return ({ entry })
  }),

  onInputUpload: async (repoRoute: any, label: string, file: any) => {
    await uploadFile(repoRoute, file);

    set((state) => {
      const entry = deepClone(state.entry);

      entry[label] = file.name;

      return { entry }
    })
  },

  onInputRemove: (label: string) => set((state) => {
    const entry = deepClone(state.entry);

    delete entry[label];

    return { entry }
  }),

  onInputUploadElectron: async (repoRoute: string, label: string) => {
    const filepath = await window.electron.uploadFile(repoRoute);

    set((state) => {
      const entry = deepClone(state.entry);

      entry[label] = filepath;

      return { entry }
    })
  },

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

  onChangeQuery: async (repoRoute: any, searchString: string) => {
    const overview = await searchRepo(repoRoute, searchString);

    set({ overview })
  },

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
}))

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
