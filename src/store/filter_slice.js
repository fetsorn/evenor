export const createFilterSlice = (set, get) => ({
  queries: {},

  groupBy: "",

  onChangeGroupBy: groupBy => set({ groupBy }),

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
