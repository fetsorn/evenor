import {
  API, generateDefaultSchemaEntry, schemaToEntry, entryToSchema,
} from 'lib/api';

// TODO: set default values for required fields
async function createEntry(schema, base) {
  const entry = {};

  const { digestMessage, randomUUID } = await import('@fetsorn/csvs-js');

  const uuid = await randomUUID();

  entry.UUID = await digestMessage(uuid);

  entry._ = base;

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

  try {
    const schema = await api.readSchema();

    const schemaEntry = await schemaToEntry(schema);

    entryNew.schema = schemaEntry;
  } catch {
    // do nothing
  }

  return entryNew;
}

async function saveRepo(repoUUID, entry) {
  const api = new API(entry.UUID);

  const remoteTags = entry.tags?.items?.filter((item) => item._ === 'remote_tag') ?? [];

  let schema = entry.schema ? entryToSchema(entry.schema) : {};

  // try to clone project to repo directory if entry has a remote tag
  if (remoteTags.length === 1) {
    try {
      const [remoteTag] = remoteTags;

      await api.clone(remoteTag.remote_tag_target, remoteTag.remote_tag_token);

      schema = await api.readSchema();
    } catch {
      // do nothing
    }
  }

  // create repo directory with a schema
  await api.ensure(schema, entry.reponame);

  // omit to not save schema branch to csvs
  const { schema: omitSchema, ...entryNew } = entry;

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

    // eslint-disable-next-line
    if (get().repoUUID === 'root' && __BUILD_MODE__ !== 'server') {
      entryNew = await selectRepo(get().repoUUID, entry);
    }

    set({ entry: entryNew, index, group });
  },

  onEntryCreate: async () => {
    const entry = await createEntry(get().schema, get().base);

    set({
      index: '',
      isEdit: true,
      title: '',
      entry,
    });
  },

  onEntryEdit: () => set({ isEdit: true, entryOriginal: get().entry }),

  onEntryRevert: () => set({ isEdit: false, entry: get().entryOriginal }),

  onEntrySave: async () => {
    let { entry } = get();

    if (entry[entry._] === undefined) {
      entry[entry._] = '';
    }

    // eslint-disable-next-line
    if (get().repoUUID === 'root' && __BUILD_MODE__ !== 'server') {
      entry = await saveRepo(get().repoUUID, get().entry);
    }

    const api = new API(get().repoUUID);

    const overview = await api.updateEntry(entry, get().overview);

    api.commit();

    set({ overview, isEdit: false });
  },

  onEntryCommit: async (uuid) => {
    const api = new API(uuid);

    api.commit();
  },

  onEntryDelete: async () => {
    const api = new API(get().repoUUID);

    const overview = await api.deleteEntry(get().entry, get().overview);

    api.commit();

    set({ overview, entry: undefined });
  },

  onEntryClose: () => set({ entry: undefined }),

  onEntryChange: (_, entry) => set({ entry }),

  onSettingsOpen: async () => {
    const apiRepo = new API(get().repoUUID);

    const baseOld = get().base;

    // get current repo settings from root db
    const entryRepo = await apiRepo.getSettings();

    const entry = await selectRepo(get().repoUUID, entryRepo);

    const apiRoot = new API('root');

    const { onEntrySave, onEntryDelete } = get();

    const onSettingsClose = () => set({
      entry: undefined,
      base: baseOld,
      onEntrySave,
      onEntryDelete,
      isSettings: false,
    });

    const onSettingsSave = async () => {
      const entryNew = await saveRepo(get().repoUUID, get().entry);

      await apiRoot.updateEntry(entryNew);

      set({ isEdit: false });
    };

    const onSettingsDelete = async () => {
      await apiRoot.deleteEntry(get().entry);

      set({
        repoUUID: 'root',
        entry: undefined,
        base: baseOld,
        onEntrySave,
        onEntryDelete,
        isSettings: false,
      });
    };

    set({
      entry,
      index: '',
      group: `${get().repoName} settings`,
      onEntryClose: onSettingsClose,
      onEntrySave: onSettingsSave,
      onEntryDelete: onSettingsDelete,
      isSettings: true,
    });
  },

  onRepoCommit: async (repoUUID) => {
    const api = new API(repoUUID);

    await api.commit();
  },
});
