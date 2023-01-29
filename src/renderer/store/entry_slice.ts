import {
  uploadFile,
  updateOverview,
  editEntry,
  deleteEntry,
  addProp,
  deepClone,
} from "../api";
import { EntrySlice } from "./types";

export const createEntrySlice: EntrySlice = (set, get) => ({
  entry: undefined,

  index: undefined,

  group: undefined,

  isEdit: false,

  isBatch: false,

  onBatchSelect: () => set({ isBatch: true }),

  onSave: async (repoRoute: any) => {
    await editEntry(repoRoute, deepClone(get().entry));

    const overview = updateOverview(get().overview, deepClone(get().entry));

    set({ overview, isEdit: false })

    document.getElementById(get().entry.UUID).scrollIntoView();
  },

  onEdit: () => set({ isEdit: true }),

  onRevert: () => set({ isEdit: false }),

  onDelete: async (repoRoute: any) => {
    const overview = await deleteEntry(repoRoute, get().overview, get().entry);

    set({ overview, entry: undefined });
  },

  onClose: () => set({ entry: undefined }),

  onAddProp: async (label: string) => {
    const entry = await addProp(get().schema, deepClone(get().entry), label);

    set({ entry })
  },

  onInputChange: (label: string, value: string) => set((state) => {
    const entry = deepClone(state.entry);

    entry[label] = value;

    return ({ entry })
  }),

  onInputUpload: async (repoRoute: any, label: string, file: any) => {
    await uploadFile(repoRoute, file);

    set((state) => {
      const entry = deepClone(state.entry);

      entry[label] = file.name;

      return { entry }
    })
  },

  onInputRemove: (label: string) => set((state) => {
    const entry = deepClone(state.entry);

    delete entry[label];

    return { entry }
  }),

  onInputUploadElectron: async (repoRoute: string, label: string) => {
    const filepath = await window.electron.uploadFile(repoRoute);

    set((state) => {
      const entry = deepClone(state.entry);

      entry[label] = filepath;

      return { entry }
    })
  }
})
