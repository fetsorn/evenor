import { OverviewType } from "./types.js";

export const createFilterSlice = (set, get) => ({
  queries: {},

  groupBy: "",

  overviewType: OverviewType.itinerary,

  onChangeGroupBy: (groupBy) => set({ groupBy }),

  onChangeOverviewType: (overviewTypeNew) => {
    const overviewTypeParam = overviewTypeNew;

    const overviewType = overviewTypeParam
      ? OverviewType[overviewTypeParam]
      : get().overviewType;

    set({ overviewType })
  },

  onQueryAdd: async (queryField, queryValue) => {
    if (queryValue) {
      const queries = { ...get().queries, [queryField]: queryValue };

      set({ queries })
    }
  },

  onQueryRemove: async (queryField) => {
    const queries = { ...get().queries };

    delete queries[queryField];

    set({ queries })
  },
})
