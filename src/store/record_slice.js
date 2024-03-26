import {
  API,
  generateDefaultSchemaRecord,
  schemaToRecord,
  recordToSchema,
} from "../api/index.js";

// TODO: set default values for required fields
async function createRecord(schema, base) {
  const record = {};

  record._ = base;

  if (base === "reponame") {
    record.reponame = "";

    record.schema = [await generateDefaultSchemaRecord()];
  }

  return record;
}

async function selectRepo(repoUUID, record) {
  // it's okay to not make a deep clone here
  const recordNew = record;

  const api = new API(record.UUID);

  try {
    const schema = await api.readSchema();

    const schemaRecord = await schemaToRecord(schema);

    recordNew.schema = schemaRecord;
  } catch {
    // do nothing
  }

  const { digestMessage, randomUUID } = await import("@fetsorn/csvs-js");

  try {
    const remotes = await api.listRemotes();

    for (const remoteName of remotes) {
      const [remoteUrl, remoteToken] = await api.getRemote(remoteName);

      if (recordNew.tags === undefined) {
        recordNew.tags = {
          UUID: await digestMessage(await randomUUID()),
          items: [],
        };
      }

      if (recordNew.tags.items === undefined) {
        recordNew.tags.items = [];
      }

      recordNew.tags.items.push({
        _: "remote_tag",
        UUID: await digestMessage(await randomUUID()),
        remote_name: remoteName,
        remote_url: remoteUrl,
        remote_token: remoteToken,
      });
    }
  } catch {
    // do nothing
  }

  try {
    const assetPaths = await api.listAssetPaths();

    for (const assetPath of assetPaths) {
      if (recordNew.tags === undefined) {
        recordNew.tags = {
          UUID: await digestMessage(await randomUUID()),
          items: [],
        };
      }

      if (recordNew.tags.items === undefined) {
        recordNew.tags.items = [];
      }

      recordNew.tags.items.push({
        _: "local_tag",
        UUID: await digestMessage(await randomUUID()),
        local_path: assetPath,
      });
    }
  } catch {
    // do nothing
  }

  return recordNew;
}

async function saveRepo(repoUUID, record) {
  const api = new API(record.UUID);

  const remoteTags =
    record.tags?.items?.filter((item) => item._ === "remote_tag") ?? [];

  let schema = record.schema ? recordToSchema(record.schema) : {};

  for (const remoteTag of remoteTags) {
    // try to clone project to repo directory if record has a remote tag, will fail if repo exists
    try {
      // const [remoteTag] = remoteTags;

      await api.clone(remoteTag.remote_url, remoteTag.remote_token);

      schema = await api.readSchema();
    } catch {
      // do nothing
    }
  }

  // create repo directory with a schema
  await api.ensure(schema, record.reponame);

  for (const remoteTag of remoteTags) {
    try {
      api.addRemote(
        remoteTag.remote_name,
        remoteTag.remote_url,
        remoteTag.remote_token,
      );
    } catch {
      // do nothing
    }
  }

  const localTags =
    record.tags?.items?.filter((item) => item._ === "local_tag") ?? [];

  for (const localTag of localTags) {
    try {
      api.addAssetPath(localTag.local_path);
    } catch {
      // do nothing
    }
  }

  // omit to not save schema branch to csvs
  // eslint-disable-next-line
  const { schema: omitSchema, ...recordNew } = record;

  if (recordNew.tags?.items) {
    // omit to not save remote tags to csvs
    const filteredTags = recordNew.tags.items.filter(
      (item) => item._ !== "remote_tag" && item._ !== "local_tag",
    );

    recordNew.tags.items = filteredTags;
  }

  return recordNew;
}

export const createRecordSlice = (set, get) => ({
  // record selected from records for viewing/editing
  record: undefined,

  // record backup before editing
  recordOriginal: undefined,

  // index of selected record in a group
  index: undefined,

  // title of the group of selected record
  group: undefined,

  isEdit: false,

  isBatch: false,

  isSettings: false,

  onBatchSelect: () => set({ isBatch: true }),

  onRecordSelect: async (record, index, group) => {
    let recordNew = record;

    // eslint-disable-next-line
    if (get().repoUUID === "root" && __BUILD_MODE__ !== "server") {
      recordNew = await selectRepo(get().repoUUID, record);
    }

    set({ record: recordNew, index, group });
  },

  onRecordCreate: async () => {
    const record = await createRecord(get().schema, get().base);

    set({
      index: "",
      isEdit: true,
      title: "",
      record,
    });
  },

  onRecordEdit: (record) =>
    set({ record, isEdit: true, recordOriginal: get().record }),

  onRecordRevert: () => set({ isEdit: false, record: get().recordOriginal }),

  onRecordSave: async () => {
    let { record } = get();

    // TODO: remove this or add comments
    if (record[record._] === undefined) {
      record[record._] = "";
    }

    // eslint-disable-next-line
    if (get().repoUUID === "root" && __BUILD_MODE__ !== "server") {
      // record = await saveRepo(get().repoUUID, get().record);
    }

    const api = new API(get().repoUUID);

    // const records = await api.updateRecord(record, get().records);

    // api.commit();

    const records = [record, ...get().records];

    set({ records, isEdit: false });
  },

  onRecordCommit: async (uuid) => {
    const api = new API(uuid);

    api.commit();
  },

  onRecordDelete: async () => {
    const api = new API(get().repoUUID);

    const records = await api.deleteRecord(get().record, get().records);

    api.commit();

    set({ records, record: undefined });
  },

  onRecordClose: () => set({ record: undefined }),

  onRecordChange: (_, record) => {
    console.log(record);
    set({ record });
  },

  onSettingsOpen: async () => {
    const apiRepo = new API(get().repoUUID);

    const baseOld = get().base;

    // get current repo settings from root db
    const recordRepo = await apiRepo.getSettings();

    const record = await selectRepo(get().repoUUID, recordRepo);

    const apiRoot = new API("root");

    const { onRecordSave, onRecordDelete } = get();

    const onSettingsClose = () =>
      set({
        record: undefined,
        base: baseOld,
        onRecordSave,
        onRecordDelete,
        isSettings: false,
      });

    const onSettingsSave = async () => {
      const recordNew = await saveRepo(get().repoUUID, get().record);

      await apiRoot.updateRecord(recordNew);

      set({ isEdit: false });
    };

    const onSettingsDelete = async () => {
      await apiRoot.deleteRecord(get().record);

      set({
        repoUUID: "root",
        record: undefined,
        base: baseOld,
        onRecordSave,
        onRecordDelete,
        isSettings: false,
      });
    };

    set({
      record,
      index: "",
      group: `${get().repoName} settings`,
      onRecordClose: onSettingsClose,
      onRecordSave: onSettingsSave,
      onRecordDelete: onSettingsDelete,
      isSettings: true,
    });
  },

  onRepoCommit: async (repoUUID) => {
    const api = new API(repoUUID);

    await api.commit();
  },
});
