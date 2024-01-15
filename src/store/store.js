import { create } from 'zustand';
import { createFilterSlice } from './filter_slice.js';
import { createOverviewSlice } from './overview_slice.js';
import { createEntrySlice } from './entry_slice.js';

export const useStore = create((...a) => ({
  ...createEntrySlice(...a),
  ...createFilterSlice(...a),
  ...createOverviewSlice(...a),
}));
