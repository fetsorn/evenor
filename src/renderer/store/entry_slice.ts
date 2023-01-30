import {
  addField,
  createEntry,
  deepClone,
  deleteEntry,
  editEntry,
  updateOverview,
  uploadFile,
} from "../api";
import { EntrySlice } from "./types";

export const createEntrySlice: EntrySlice = (set, get) => ({
  // entry selected from overview for viewing/editing
  entry: undefined,

  // index of selected entry in a group
  index: undefined,

  // title of the group of selected entry
  group: undefined,

  isEdit: false,

  isBatch: false,

  onBatchSelect: () => set({ isBatch: true }),

  onEntrySelect: (entryNew: any, indexNew: any, groupNew: any) => set({ entry: entryNew, index: indexNew, group: groupNew }),

  onEntryCreate: async (index: string) => {
    const entry = await createEntry();

    set({ index, isEdit: true, entry })
  },

  onEntryEdit: () => set({ isEdit: true }),

  onEntryRevert: () => set({ isEdit: false }),

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

  onFieldAdd: async (label: string) => {
    const entry = await addField(get().schema, deepClone(get().entry), label);

    set({ entry })
  },

  onFieldChange: (label: string, value: string) => {
    const entry = deepClone(get().entry);

    entry[label] = value;

    set({ entry })
  },

  onFieldUpload: async (label: string, file: any) => {
    await uploadFile(get().repoRoute, file);

    const entry = deepClone(get().entry);

    entry[label] = file.name;

    set({ entry });
  },

  onFieldRemove: (label: string) => {
    const entry = deepClone(get().entry);

    delete entry[label];

    set({ entry })
  },

  onFieldUploadElectron: async (label: string) => {
    const filepath = await window.electron.uploadFile(get().repoRoute);

    const entry = deepClone(get().entry);

    entry[label] = filepath;

    set({ entry })
  }
})
