import { condense } from "@fetsorn/csvs-js";
import {
  API,
  generateDefaultRepoRecord,
} from "../api/index.js";
import { saveRepoRecord, loadRepoRecord, newUUID } from "./bin.js";

export const createProfileSlice = (set, get) => ({
  // record selected from records for viewing/editing
  record: undefined,

  isEdit: false,

  isSettings: false,

  // write record to the dataset
  onRecordCreate: async () => {
    const { repoUUID } = get();

    const isHomeScreen = repoUUID === "root";

    // eslint-disable-next-line
    // const isNotServer = __BUILD_MODE__ !== "server";

    // const canSaveRepo = isHomeScreen && isNotServer;
    const canSaveRepo = isHomeScreen;

    const record = canSaveRepo
          ? await saveRepoRecord(get().record.repo, condense(get().schema, get().record))
          : get().record;

    const api = new API(repoUUID);

    const records = await api.updateRecord(record, get().records);

    await api.commit();

    set({ records, record, isEdit: false });
  },

  // open view, close view or revert edit
  onRecordSelect: async (recordNew) => {
    // eslint-disable-next-line
    // const isHomeScreen = get().repoUUID === "root" && __BUILD_MODE__ !== "server";
    const isHomeScreen = get().repoUUID === "root";

    const isNewRecord = recordNew !== undefined;

    const canSelectRepo = isHomeScreen && isNewRecord;

    // when selecting a repo, load git state and schema from dataset into the record
    const record = canSelectRepo ? await loadRepoRecord("root", recordNew) : recordNew;

    set({ record, isEdit: false });
  },

  // create new record or update old record
  onRecordUpdate: async (recordNew) => {
    const { repoUUID, base } = get();

    // if new repo record, set default values for required fields
    const isRepoRecord = repoUUID === "root" && base === "repo";

    const defaults = isRepoRecord ? generateDefaultRepoRecord() : {};

    const record = recordNew ?? {
      ...defaults,
      _: base,
      [base]: await newUUID(),
    };

    set({ record, isEdit: true });
  },

  // delete record form the dataset
  onRecordDelete: async () => {
    const api = new API(get().repoUUID);

    const records = await api.deleteRecord(get().record, get().records);

    await api.commit();

    set({ records, record: undefined, isEdit: false });
  },

  // override all record store functions to act on the root repo
  onSettingsOpen: async () => {
    const apiRepo = new API(get().repoUUID);

    const baseBackup = get().base;

    // get current repo settings from root db
    const recordRepo = await apiRepo.getSettings()

    // load git state and schema from dataset into the record
    const recordSettings = await loadRepoRecord(get().repoUUID, recordRepo);

    const apiRoot = new API("root");

    const {
      onRecordCreate: onRecordCreateBackup,
      onRecordDelete: onRecordDeleteBackup
    } = get();

    const onRecordCreateSettings = async () => {
      const recordNew = await saveRepoRecord(get().repoUUID, get().record);

      await apiRoot.updateRecord(recordNew);

      set({ isEdit: false });
    };

    const onRecordSelectSettings = (recordNew) => {
      if (recordNew === undefined) {
        set({
          base: baseBackup,
          isSettings: false,
          onRecordCreate: onRecordCreateBackup,
          onRecordDelete: onRecordDeleteBackup,
        });
      }

      set({ isEdit: false, record: recordNew });
    };

    const onRecordDeleteSettings = async () => {
      await apiRoot.deleteRecord(get().record);

      set({
        base: "repo",
        repoUUID: "root",
        record: undefined,
        isSettings: false,
        onRecordCreate: onRecordCreateBackup,
        onRecordDelete: onRecordDeleteBackup,
      });
    };

    set({
      isSettings: true,
      record: recordSettings,
      onRecordSelect: onRecordSelectSettings,
      onRecordDelete: onRecordDeleteSettings,
      onRecordCreate: onRecordCreateSettings,
    });
  },
});
