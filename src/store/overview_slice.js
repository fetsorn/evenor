import { API } from "../api/index.js";
import { queriesToParams } from "./bin.js";

export const createOverviewSlice = (set, get) => ({
  queries: {},

  base: undefined,

  sortBy: "",

  schema: {},

  records: [],

  repoUUID: "root",

  abortPreviousStream: () => {},

  setQuery: async (queryField, queryValue) => {
    const { queries } = get();

    if (queryField === undefined) {
      set({ queries: {} })
    } else {
      // TODO: validate queryField

      if (queryValue === undefined) {
        delete queries[queryField];
      } else {
        queries[queryField] = queryValue;
      }

      set({ queries });
    }

    // abort previous search stream if it is running
    get().abortPreviousStream();

    let isAborted = false;

    const abort_controller = new AbortController();

    set({
      abortPreviousStream: async () => {
        isAborted = true;

        await abort_controller.abort();
      },
    });

    const { base, repoUUID } = get();

    const api = new API(repoUUID);

    const schema = await api.readSchema();

    const searchParams = queriesToParams(queries);

    searchParams.set("_", base);

    const { strm: fromStrm, closeHandler } =
      await api.selectStream(searchParams);

    const toStrm = new WritableStream({
      write(chunk) {
        if (isAborted) {
          return;
        }

        const records = [...get().records, chunk];

        // TODO: reset base and sort here

        set({
          records,
        });
      },

      abort() {
        // stream interrupted
        // no need to await on the promise, closing api stream for cleanup
        closeHandler();
      },
    });

    try {
      await fromStrm.pipeTo(toStrm, { signal: abort_controller.signal });
    } catch {
      // stream interrupted
    }
  },

  setSortBy: async (sortBy) => {
    set({
      sortBy,
    });
  },

  setRepoUUID: async (repoUUID) => {
    // abort previous search stream if it is running
    get().abortPreviousStream();

    set({
      repoUUID,
    });

    // reset all queries
    await get().setQuery(undefined, undefined);
  },

  setBase: async (base) => {
    set({ base, records: [] });

    // reset all queries
    await get().setQuery(undefined, undefined);
  },
});
