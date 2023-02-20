import { digestMessage, randomUUIDPolyfill } from "@fetsorn/csvs-js";
import { API } from "lib/api";
import { EntrySlice } from "./types";

// TODO: set default values for required fields
async function createEntry(schema: any, base: string) {
  const entry: Record<string, any> = {};

  const uuid = crypto.randomUUID ? crypto.randomUUID() : randomUUIDPolyfill();

  entry.UUID = await digestMessage(uuid);

  entry["|"] = base;

  if (schema[base].type === "array") {
    entry.items = [];
  }

  return entry;
}

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
    const apiRepo = new API(get().repoRoute);

    // get current repo settings from root db
    const entry = await apiRepo.getSettings()

    const repoRouteRoot = "store/root";

    const apiRoot = new API(repoRouteRoot);

    const { onEntrySave, onEntryDelete } = get();

    const onSettingsClose = () => set({
      entry: undefined,
      onEntrySave,
      onEntryDelete,
      isSettings: false
    });

    const onSettingsSave = async () => {
      await apiRoot.updateEntry(get().entry);

      set({ isEdit: false })
    }

    const onSettingsDelete = async () => {
      await apiRoot.deleteEntry(get().entry);

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
    const api = new API(get().repoRoute);

    const overview = await api.updateEntry(get().entry, get().overview);

    set({ overview, isEdit: false })
  },

  onEntryDelete: async () => {
    const api = new API(get().repoRoute);

    const overview = await api.deleteEntry(get().entry, get().overview);

    set({ overview, entry: undefined });
  },

  onEntryClose: () => set({ entry: undefined }),

  onEntryChange: (_, entry: string) => set({ entry }),
})
