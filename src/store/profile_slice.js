import { API } from "../api/index.js";
import {
  saveRepoRecord,
  loadRepoRecord,
  defaultRepoRecord,
  newUUID,
} from "./bin.js";

export const createProfileSlice = (set, get) => ({
  // record selected from records for viewing/editing
  record: undefined,

  // whether the record is being edited
  isEdit: false,

  // write record to the folder
  onRecordUpdate: async (recordOld, recordNew) => {
    const {
      schema,
      queries: { _: base },
      repo: { repo: repoUUID },
      records: recordsOld,
    } = get();

    const api = new API(repoUUID);

    const isHomeScreen = repoUUID === "root";

    const isRepoBranch = base === "repo";

    // eslint-disable-next-line
    // const isNotServer = __BUILD_MODE__ !== "server";

    // const canSaveRepo = isHomeScreen && isNotServer;
    const canSaveRepo = isHomeScreen && base === "repo";

    // won't save root/branch-trunk.csv to disk as it's read from repo/_-_.csv
    if (canSaveRepo) {
      const branches = recordNew["branch"].map(
        ({ trunk, ...branchWithoutTrunk }) => branchWithoutTrunk,
      );

      const recordPruned = { ...recordNew, branch: branches };

      await api.updateRecord(recordPruned);
    } else {
      await api.updateRecord(recordNew);
    }

    // replace old record with the new
    const recordsNew = recordsOld
      .filter((record) => record[base] !== recordOld[base])
      .concat([recordNew]);

    await api.commit();

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

    // when selecting a repo, load git state and schema from folder into the record
    const record = canSelectRepo ? await loadRepoRecord(recordNew) : recordNew;

    set({ record, isEdit: false });
  },

  // create new record or update old record
  onRecordInput: async (recordNew) => {
    const {
      repo: { repo: repoUUID },
      queries: { _: base },
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

  // delete record from the folder
  onRecordDelete: async (recordOld) => {
    const {
      queries: { _: base },
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
