import {
  ensureRoot,
  searchRepo,
  fetchSchema,
  createEntry,
  getDefaultGroupBy,
} from "../api";
import { OverviewSlice, OverviewType } from "./types";

export const createOverviewSlice: OverviewSlice = (set) => ({

  schema: {},

  overview: [],

  isLoaded: false,

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

  onEntrySelect: (entryNew: any, indexNew: any, groupNew: any) => set({ entry: entryNew, index: indexNew, group: groupNew }),

  onEntryCreate: async (index: string) => {
    const entry = await createEntry();

    set({ index, isEdit: true, entry })
  },

})
