import { condense } from "@fetsorn/csvs-js";
import { API, defaultRepoRecord, newUUID } from "../api/index.js";
import { saveRepoRecord, loadRepoRecord } from "./bin.js";

export const createProfileSlice = (set, get) => ({
  // record selected from records for viewing/editing
  record: undefined,

  isEdit: false,

  // write record to the dataset
  onRecordUpdate: async (recordOld, recordNew) => {
    const {
      base,
      schema,
      repo: { repo: repoUUID },
      records: recordsOld,
    } = get();

    const api = new API(repoUUID);

    await api.updateRecord(recordNew);

    // replace old record with the new
    const recordsNew = recordsOld
      .filter((record) => record[base] !== recordOld[base])
      .concat([recordNew]);

    await api.commit();

    const isHomeScreen = repoUUID === "root";

    // eslint-disable-next-line
    // const isNotServer = __BUILD_MODE__ !== "server";

    // const canSaveRepo = isHomeScreen && isNotServer;
    const canSaveRepo = isHomeScreen;

    if (canSaveRepo) {
      await saveRepoRecord(recordNew);
    }

    set({ records: recordsNew, record: recordNew, isEdit: false });
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
    const record = canSelectRepo ? await loadRepoRecord(recordNew) : recordNew;

    set({ record, isEdit: false });
  },

  // create new record or update old record
  onRecordInput: async (recordNew) => {
    const {
      repo: { repo: repoUUID },
      base,
    } = get();

    // if new repo record, set default values for required fields
    const isRepoRecord = repoUUID === "root" && base === "repo";

    const repoPartial = isRepoRecord ? defaultRepoRecord : {};

    const record = recordNew ?? {
      _: base,
      [base]: await newUUID(),
      ...repoPartial,
    };

    set({ record, isEdit: true });
  },

  // delete record form the dataset
  onRecordDelete: async (recordOld) => {
    const {
      base,
      repo: { repo: repoUUID },
      records: recordsOld,
    } = get();

    const api = new API(repoUUID);

    await api.deleteRecord(recordOld);

    const recordsNew = recordsOld.filter(
      (record) => record[base] !== recordOld[base],
    );

    await api.commit();

    set({ records: recordsNew, record: undefined, isEdit: false });
  },
});
