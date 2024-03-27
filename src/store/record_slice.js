import { condense } from "@fetsorn/csvs-js";
import {
  API,
  generateDefaultSchemaRecord,
} from "../api/index.js";
import { saveRepoRecord, loadRepoRecord, createRecord, newUUID } from "./bin.js";

export const createRecordSlice = (set, get) => ({
  // record selected from records for viewing/editing
  record: undefined,

  isEdit: false,

  isSettings: false,

  // open view, close view or revert edit
  onRecordSelect: async (recordNew) => {
    // eslint-disable-next-line
    const isHomeScreen = get().repoUUID === "root" && __BUILD_MODE__ !== "server";

    const isNewRecord = recordNew !== undefined;

    const canSelectRepo = isHomeScreen && isNewRecord;

    // when selecting a repo, load git state and schema from dataset into the record
    const record = canSelectRepo ? await loadRepoRecord("root", recordNew) : recordNew;

    set({ record, isEdit: false });
  },

  // create new record or update old record
  onRecordChange: async (recordNew) => {
    const { repoUUID, base } = get();

    // if new repo record, set default values for required fields
    const isRepoRecord = repoUUID === "root" && base === "repo"

    const defaults = isRepoRecord ? {
      reponame: "",
      schema: [await generateDefaultSchemaRecord()],
    } : {};

    const record = recordNew ?? {
      _: base,
      [base]: await newUUID(),
      ...defaults
    };

    set({ record, isEdit: true });
  },

  // write record to the dataset
  onRecordSave: async () => {
    const { repoUUID } = get();

    const isHomeScreen = repoUUID === "root";

    // eslint-disable-next-line
    const isNotServer = __BUILD_MODE__ !== "server";

    const canSaveRepo = isHomeScreen && isNotServer;

    const record = canSaveRepo
          ? await saveRepoRecord(repoUUID, condense(get().schema, get().record))
          : get().record;

    const api = new API(repoUUID);

    const records = await api.updateRecord(record, get().records);

    await api.commit();

    set({ records, record, isEdit: false });
  },

  // delete record form the dataset
  onRecordDelete: async () => {
    const api = new API(get().repoUUID);

    const records = await api.deleteRecord(get().record, get().records);

    await api.commit();

    set({ records, record: undefined, isEdit: false });
  },

  onSettingsOpen: async () => {
    const apiRepo = new API(get().repoUUID);

    const baseBackup = get().base;

    // get current repo settings from root db
    const recordRepo = await apiRepo.getSettings();

    const record = await loadRepoRecord(get().repoUUID, recordRepo);

    const apiRoot = new API("root");

    const { onRecordSave, onRecordDelete } = get();

    const onSettingsSelect = (recordNew) => {
      if (recordNew === undefined) {
        set({
          base: baseBackup,
          onRecordSave,
          onRecordDelete,
          isSettings: false,
        });
      }

      set({ isEdit: false, record: recordNew })
    }

    const onSettingsSave = async () => {
      const recordNew = await saveRepoRecord(get().repoUUID, get().record);

      await apiRoot.updateRecord(recordNew);

      set({ isEdit: false });
    };

    const onSettingsDelete = async () => {
      await apiRoot.deleteRecord(get().record);

      set({
        repoUUID: "root",
        record: undefined,
        // makes no sense to set base back to that of deleted project's record
        // TODO: set default base of "root" repo
        base: baseBackup,
        onRecordSave,
        onRecordDelete,
        isSettings: false,
      });
    };

    set({
      record,
      onRecordSelect: onSettingsSelect,
      onRecordSave: onSettingsSave,
      onRecordDelete: onSettingsDelete,
      isSettings: true,
    });
  },
});
