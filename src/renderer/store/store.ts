import { create } from 'zustand';
import { IStore } from './types';
import { createFilterSlice } from './filter_slice';
import { createOverviewSlice } from './overview_slice';
import { createEntrySlice } from './entry_slice';

export const useStore = create<IStore>((...a) => ({
  ...createEntrySlice(...a),
  ...createFilterSlice(...a),
  ...createOverviewSlice(...a),
}))
