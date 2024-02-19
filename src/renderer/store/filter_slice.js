import { OverviewType } from "./types.js";

export const createFilterSlice = (set, get) => ({
  queries: {},

  sortby: "",

  overviewType: OverviewType.itinerary,

  onChangeSortBy: (sortby) => set({ sortby }),

  onChangeOverviewType: (overviewTypeNew) => {
    const overviewType = overviewTypeNew
      ? OverviewType[overviewTypeNew]
      : get().overviewType;

    set({ overviewType });
  },

  onQueryAdd: async (queryField, queryValue) => {
    const { queries } = get();

    queries[queryField] = queryValue;

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
