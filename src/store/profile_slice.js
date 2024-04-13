import { condense } from "@fetsorn/csvs-js";
import { API, generateDefaultRepoRecord, newUUID } from "../api/index.js";
import { saveRepoRecord, loadRepoRecord } from "./bin.js";

export const createProfileSlice = (set, get) => ({
  // record selected from records for viewing/editing
  record: undefined,

  isEdit: false,

  isSettings: false,

  // write record to the dataset
  onRecordCreate: async () => {
    const { repo } = get();

    const { repo: repoUUID } = repo;

    const isHomeScreen = repoUUID === "root";

    // eslint-disable-next-line
    // const isNotServer = __BUILD_MODE__ !== "server";

    // const canSaveRepo = isHomeScreen && isNotServer;
    const canSaveRepo = isHomeScreen;

    const record = canSaveRepo
      ? await saveRepoRecord(
          get().record.repo,
          condense(get().schema, get().record),
        )
      : get().record;

    const api = new API(repoUUID);

    const records = await api.updateRecord(record, get().records);

    await api.commit();

    set({ records, record, isEdit: false });
  },

  // open view, close view or revert edit
  onRecordSelect: async (recordNew) => {
    const { repo } = get();

    const { repo: repoUUID } = repo;
    // eslint-disable-next-line
    // const isHomeScreen = get().repoUUID === "root" && __BUILD_MODE__ !== "server";
    const isHomeScreen = repoUUID === "root";

    const isNewRecord = recordNew !== undefined;

    const canSelectRepo = isHomeScreen && isNewRecord;

    // when selecting a repo, load git state and schema from dataset into the record
    const record = canSelectRepo
      ? await loadRepoRecord("root", recordNew)
      : recordNew;

    set({ record, isEdit: false });
  },

  // create new record or update old record
  onRecordUpdate: async (recordNew) => {
    const { repo, base } = get();

    const { repo: repoUUID } = repo;

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
    const { repo, record, records } = get();

    const { repo: repoUUID } = repo;

    const api = new API(repoUUID);

    const recordsNew = await api.deleteRecord(record, records);

    await api.commit();

    set({ records: recordsNew, record: undefined, isEdit: false });
  },

  // override all record store functions to act on the root repo
  onSettingsOpen: async () => {
    const { repo } = get();

    const { repo: repoUUID } = repo;

    const apiRepo = new API(repoUUID);

    const baseBackup = get().base;

    // get current repo settings from root db
    const recordRepo = await apiRepo.getSettings();

    // load git state and schema from dataset into the record
    const recordSettings = await loadRepoRecord(repoUUID, recordRepo);

    const apiRoot = new API("root");

    const {
      onRecordCreate: onRecordCreateBackup,
      onRecordDelete: onRecordDeleteBackup,
    } = get();

    const onRecordCreateSettings = async () => {
      const recordNew = await saveRepoRecord(repoUUID, get().record);

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
        repo: { _: "repo", repo: "root" },
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
