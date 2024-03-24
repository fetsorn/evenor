import { create } from "zustand";
import { createFilterSlice } from "./filter_slice.js";
import { createOverviewSlice } from "./overview_slice.js";
import { createRecordSlice } from "./record_slice.js";

export const useStore = create((...a) => ({
  ...createRecordSlice(...a),
  ...createFilterSlice(...a),
  ...createOverviewSlice(...a),
}));
