import { create } from 'zustand';
import { createFilterSlice } from './filter_slice';
import { createOverviewSlice } from './overview_slice';
import { createEntrySlice } from './entry_slice';
import { IStore } from './types';

export const useStore = create<IStore>((...a) => ({
  ...createEntrySlice(...a),
  ...createFilterSlice(...a),
  ...createOverviewSlice(...a),
}))
