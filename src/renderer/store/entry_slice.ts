import {
  createEntry,
  deepClone,
  deleteEntry,
  editEntry,
  updateOverview,
  getRepoSettings,
} from "../api";
import { EntrySlice } from "./types";

export const createEntrySlice: EntrySlice = (set, get) => ({
  // entry selected from overview for viewing/editing
  entry: undefined,

  // entry backup before editing
  entryOriginal: undefined,

  // index of selected entry in a group
  index: undefined,

  // title of the group of selected entry
  group: undefined,

  isEdit: false,

  isBatch: false,

  isSettings: false,

  onBatchSelect: () => set({ isBatch: true }),

  onEntrySelect: (entry: any, index: any, group: any) => set({ entry, index, group }),

  onSettingsOpen: async () => {
    // get current repo settings from root db
    const entry = await getRepoSettings(get().repoRoute)

    const repoRouteRoot = "store/root";

    const { onEntrySave, onEntryDelete } = get();

    const onSettingsClose = () => set({
      entry: undefined,
      onEntrySave,
      onEntryDelete,
      isSettings: false
    });

    const onSettingsSave = async () => {
      await editEntry(repoRouteRoot, deepClone(get().entry));

      set({ isEdit: false })
    }

    const onSettingsDelete = async () => {
      await deleteEntry(repoRouteRoot, [], deepClone(get().entry));

      set({
        repoRoute: repoRouteRoot,
        entry: undefined,
        onEntrySave,
        onEntryDelete,
        isSettings: false
      });
    }

    set({
      entry,
      index: "",
      group: `${get().repoRoute} settings`,
      onEntryClose: onSettingsClose,
      onEntrySave: onSettingsSave,
      onEntryDelete: onSettingsDelete,
      isSettings: true
    })
  },

  onEntryCreate: async (index: string) => {
    const entry = await createEntry(get().schema, get().base);

    set({ index, isEdit: true, entry })
  },

  onEntryEdit: () => set({ isEdit: true, entryOriginal: get().entry }),

  onEntryRevert: () => set({ isEdit: false, entry: get().entryOriginal }),

  onEntrySave: async () => {
    await editEntry(get().repoRoute, deepClone(get().entry));

    const overview = updateOverview(get().overview, deepClone(get().entry));

    set({ overview, isEdit: false })
  },

  onEntryDelete: async () => {
    const overview = await deleteEntry(get().repoRoute, get().overview, get().entry);

    set({ overview, entry: undefined });
  },

  onEntryClose: () => set({ entry: undefined }),

  onEntryChange: (_, entry: string) => set({ entry }),
})
