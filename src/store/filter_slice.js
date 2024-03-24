export const createFilterSlice = (set, get) => ({
  queries: {},

  sortBy: "",

  onChangeSortBy: (sortBy) => set({ sortBy }),

  onQueryAdd: async (queryField, queryValue) => {
    const { queries } = get();

    queries[queryField] = queryValue;

    set({ queries });

    await get().onQueries();
  },

  onQueryRemove: async (queryField) => {
    if (queryField !== "_" && queryField !== ".sort") {
      const queries = { ...get().queries };

      delete queries[queryField];

      set({ queries });

      await get().onQueries();
    }
  },
});
