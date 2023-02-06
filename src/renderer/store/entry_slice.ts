import {
  addField,
  createEntry,
  deepClone,
  deleteEntry,
  editEntry,
  updateOverview,
  uploadFile,
  getRepoSettings,
} from "../api";
import { EntrySlice } from "./types";
import { manifestRoot } from "../../lib/git_template";

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

    console.log(entry)

    const repoRouteRoot = "store/root";

    const { onEntrySave, onEntryDelete, onFieldAdd } = get();

    const onSettingsClose = () => set({ entry: undefined, onEntrySave, onEntryDelete, onFieldAdd, isSettings: false });

    const onSettingsSave = async () => {
      await editEntry(repoRouteRoot, deepClone(get().entry));

      set({ isEdit: false })
    }

    const onSettingsDelete = () => {
      console.log("not implemented")

      set({ entry: undefined, onEntrySave, onEntryDelete, onFieldAdd, isSettings: false });
    }

    const onSettingsAdd = async (label: string) => {
      const rootSchema = JSON.parse(manifestRoot);

      const entry = await addField(rootSchema, deepClone(get().entry), label);

      set({ entry })
    }

    // ignore fieldUpload

    set({ entry, index: "", group: `${get().repoRoute} settings`, onEntryClose: onSettingsClose, onEntrySave: onSettingsSave, onEntryDelete: onSettingsDelete, onFieldAdd: onSettingsAdd, isSettings: true })
  },

  onEntryCreate: async (index: string) => {
    const entry = await createEntry();

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

  onFieldAdd: async (label: string) => {
    const entry = await addField(get().schema, deepClone(get().entry), label);

    set({ entry })
  },

  onFieldChange: (label: string, value: string) => {
    const entry = deepClone(get().entry);

    entry[label] = value;

    set({ entry })
  },

  onFieldRemove: (label: string) => {
    const entry = deepClone(get().entry);

    delete entry[label];

    set({ entry })
  },

  onFieldUpload: async (label: string, file: any) => {
    await uploadFile(get().repoRoute, file);

    const entry = deepClone(get().entry);

    entry[label] = file.name;

    set({ entry });
  },

  onFieldUploadElectron: async (label: string) => {
    const filepath = await window.electron.uploadFile(get().repoRoute);

    const entry = deepClone(get().entry);

    entry[label] = filepath;

    set({ entry })
  }
})
