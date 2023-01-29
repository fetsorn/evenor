import { FilterSlice, OverviewType } from "./types";

export const createFilterSlice: FilterSlice = (set, get) => ({
  queries: {},

  groupBy: "",

  overviewType: OverviewType.itinerary,

  onChangeGroupBy: (groupBy: string) => set({ groupBy }),

  onChangeOverviewType: (overviewTypeNew: string) => {
    const overviewTypeParam = overviewTypeNew as keyof typeof OverviewType;

    const overviewType = overviewTypeParam
      ? OverviewType[overviewTypeParam]
      : get().overviewType;

    set({ overviewType })
  },

  onQueryAdd: async (queryField: string, queryValue: string) => {
    if (queryValue) {
      const queries = { ...get().queries, [queryField]: queryValue };

      set({ queries })
    }
  },

  onQueryRemove: async (queryField: string) => {
    const queries: any = { ...get().queries };

    delete queries[queryField];

    set({ queries })
  },
})
