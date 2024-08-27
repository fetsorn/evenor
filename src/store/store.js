import { create } from "zustand";
import { createOverviewSlice } from "./overview_slice.js";
import { createProfileSlice } from "./profile_slice.js";

export const useStore = create((...a) => ({
  ...createProfileSlice(...a),
  ...createOverviewSlice(...a),
}));

useStore.getState().initialize();
