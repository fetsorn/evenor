import { create } from "zustand";
import { unstable_batchedUpdates } from "react-dom";
import { API, schemaRoot } from "../api/index.js";
import { createOverviewSlice } from "./overview_slice.js";
import { createProfileSlice } from "./profile_slice.js";

export const useStore = create((...a) => ({
  ...createProfileSlice(...a),
  ...createOverviewSlice(...a),
}));

useStore.getState().initialize();
