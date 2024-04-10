import { create } from "zustand";
import { unstable_batchedUpdates } from 'react-dom';
import { API, schemaRoot } from "../api/index.js";
import { createOverviewSlice } from "./overview_slice.js";
import { createProfileSlice } from "./profile_slice.js";
import { schemaToBranchRecords } from "./bin.js";

async function initialize() {
  const api = new API("root");

  await api.ensure();

  const records = schemaToBranchRecords(schemaRoot);

  for (const record of records) {
    await api.updateRecord(record, []);
  }

  await api.commit();

  unstable_batchedUpdates(() => {
    useStore.getState().setQuery(undefined, undefined)
  })
}

initialize();

export const useStore = create((...a) => ({
  ...createProfileSlice(...a),
  ...createOverviewSlice(...a),
}));
