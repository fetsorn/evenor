import { digestMessage, randomUUID } from '@fetsorn/csvs-js';
import {
  API, generateDefaultSchemaEntry, schemaToEntry, entryToSchema,
} from 'lib/api';

// TODO: set default values for required fields
async function createEntry(schema, base) {
  const entry = {};

  const uuid = await randomUUID();

  entry.UUID = await digestMessage(uuid);

  entry['|'] = base;

  if (schema[base].type === 'array') {
    entry.items = [];
  }

  if (base === 'reponame') {
    entry.schema = await generateDefaultSchemaEntry();
  }

  return entry;
}

async function selectRepo(repoUUID, entry) {
  // it's okay to not make a deep clone here
  const entryNew = entry;

  const api = new API(entry.UUID);

  const schema = await api.readSchema();

  const schemaEntry = await schemaToEntry(schema);

  console.log(schemaEntry);

  if (schema) {
    entryNew.schema = schemaEntry;
  }

  return entryNew;
}

async function saveRepo(repoUUID, entry) {
  const api = new API(entry.UUID);

  const remoteTags = entry.tags?.items?.filter((item) => item['|'] === 'remote_tag') ?? [];

  let schemaString = entry.schema ? entryToSchema(entry.schema) : '{}';

  if (remoteTags.length === 1) {
    // TODO: only do if no .git exists yet
    const [remoteTag] = remoteTags;

    await api.clone(remoteTag.remote_tag_target, remoteTag.remote_tag_token);

    schemaString = JSON.stringify(await api.readSchema());
  }

  await api.ensure(schemaString, entry.reponame);

  const { schema, ...entryNew } = entry;

  return entryNew;
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

  onEntrySelect: async (entry, index, group) => {
    let entryNew = entry;

    if (get().repoUUID === 'root') {
      entryNew = await selectRepo(get().repoUUID, entry);
    }

    set({ entry: entryNew, index, group });
  },

  onEntryCreate: async (index) => {
    const entry = await createEntry(get().schema, get().base);

    set({ index, isEdit: true, entry });
  },

  onEntryEdit: () => set({ isEdit: true, entryOriginal: get().entry }),

  onEntryRevert: () => set({ isEdit: false, entry: get().entryOriginal }),

  onEntrySave: async () => {
    let { entry } = get();

    if (get().repoUUID === 'root') {
      entry = await saveRepo(get().repoUUID, get().entry);
    }

    const api = new API(get().repoUUID);

    const overview = await api.updateEntry(entry, get().overview);

    set({ overview, isEdit: false });
  },

  onEntryDelete: async () => {
    const api = new API(get().repoUUID);

    const overview = await api.deleteEntry(get().entry, get().overview);

    set({ overview, entry: undefined });
  },

  onEntryClose: () => set({ entry: undefined }),

  onEntryChange: (_, entry) => set({ entry }),

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

});
