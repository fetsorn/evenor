import {
  API,
  generateDefaultSchemaRecord,
  schemaToRecord,
  recordToSchema,
} from "../api/index.js";

import { saveRepo, selectRepo, createRecord } from "./bin.js";

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
    // TODO: remove let
    let { record } = get();

    console.log("onRecordSave", record)
    // TODO: remove this or add comments
    if (record[record._] === undefined) {
      record[record._] = "";
    }

    // eslint-disable-next-line
    if (get().repoUUID === "root" && __BUILD_MODE__ !== "server") {
      record = await saveRepo(get().repoUUID, get().record);
    }

    const api = new API(get().repoUUID);

    const records = await api.updateRecord(record, get().records);

    api.commit();

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
