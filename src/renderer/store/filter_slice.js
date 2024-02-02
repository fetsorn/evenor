import { OverviewType } from "./types.js";

export const createFilterSlice = (set, get) => ({
  queries: {},

  groupBy: "",

  overviewType: OverviewType.itinerary,

  onChangeGroupBy: (groupBy) => set({ groupBy }),

  onChangeOverviewType: (overviewTypeNew) => {
    const overviewType = overviewTypeNew
      ? OverviewType[overviewTypeNew]
      : get().overviewType;

    set({ overviewType });
  },

  onQueryAdd: async (queryField, queryValue) => {
    const { queries } = get();
    // queries = {}
    queries[queryField] = queryValue;
    // queries = { "category": "d" }
    set({ queries });

    await get().onQueries();
  },

  onQueryRemove: async (queryField) => {
    if (queryField !== "_" && queryField !== ".group") {
      const queries = { ...get().queries };

      delete queries[queryField];

      set({ queries });

      await get().onQueries();
    }
  },
});
