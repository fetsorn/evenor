import { digestMessage, randomUUIDPolyfill } from '@fetsorn/csvs-js';
import { API } from 'lib/api';

// TODO: set default values for required fields
async function createEntry(schema, base) {
  const entry = {};

  const uuid = crypto.randomUUID ? crypto.randomUUID() : randomUUIDPolyfill();

  entry.UUID = await digestMessage(uuid);

  entry['|'] = base;

  if (schema[base].type === 'array') {
    entry.items = [];
  }

  return entry;
}

export const createEntrySlice = (set, get) => ({
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

  onEntrySelect: (entry, index, group) => set({ entry, index, group }),

  onSettingsOpen: async () => {
    const apiRepo = new API(get().repoUUID);

    // get current repo settings from root db
    const entry = await apiRepo.getSettings();

    const apiRoot = new API('root');

    const { onEntrySave, onEntryDelete } = get();

    const onSettingsClose = () => set({
      entry: undefined,
      onEntrySave,
      onEntryDelete,
      isSettings: false,
    });

    const onSettingsSave = async () => {
      await apiRoot.updateEntry(get().entry);

      set({ isEdit: false });
    };

    const onSettingsDelete = async () => {
      await apiRoot.deleteEntry(get().entry);

      set({
        repoUUID: 'root',
        entry: undefined,
        onEntrySave,
        onEntryDelete,
        isSettings: false,
      });
    };

    set({
      entry,
      index: '',
      group: `${get().repoUUID} ${get().repoName} settings`,
      onEntryClose: onSettingsClose,
      onEntrySave: onSettingsSave,
      onEntryDelete: onSettingsDelete,
      isSettings: true,
    });
  },

  onEntryCreate: async (index) => {
    const entry = await createEntry(get().schema, get().base);

    set({ index, isEdit: true, entry });
  },

  onEntryEdit: () => set({ isEdit: true, entryOriginal: get().entry }),

  onEntryRevert: () => set({ isEdit: false, entry: get().entryOriginal }),

  onEntrySave: async () => {
    const api = new API(get().repoUUID);

    const overview = await api.updateEntry(get().entry, get().overview);

    set({ overview, isEdit: false });
  },

  onEntryDelete: async () => {
    const api = new API(get().repoUUID);

    const overview = await api.deleteEntry(get().entry, get().overview);

    set({ overview, entry: undefined });
  },

  onEntryClose: () => set({ entry: undefined }),

  onEntryChange: (_, entry) => set({ entry }),
});
