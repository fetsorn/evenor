import { create } from "zustand";
import { unstable_batchedUpdates } from 'react-dom';
import { API, schemaRoot } from "../api/index.js";
import { createOverviewSlice } from "./overview_slice.js";
import { createProfileSlice } from "./profile_slice.js";

// { entry: { description: { en: "", ru: "" } }, datum: { trunk: "entry" } }
// [ {_: "_", entry: [ "datum" ]},
//   {_: branch, branch: "entry", description_en: "", description_ru: ""},
//   {_: branch, branch: "datum"}
// ]
function schemaToBranchRecords(schema) {
  const branches = Object.keys(schema);

  const records = branches.reduce((acc, branch) => {
    const { trunk, task, description } = schema[branch];

    const accLeaves = acc.schemaRecord[trunk] ?? [];

    const schemaRecord = trunk !== undefined
          ? { ...acc.schemaRecord, [trunk]: [ branch, ...accLeaves ] }
          : acc.schemaRecord;

    const partialEn = description && description.en
          ? { description_en: description.en }
          : {};

    const partialRu = description && description.ru
          ? { description_ru: description.ru }
          : {};

    const partialTask = task ? { task } : {};

    const metaRecords = [
      { _: 'branch', branch, ...partialTask, ...partialEn, ...partialRu },
      ...acc.metaRecords
    ];

    return { schemaRecord, metaRecords }
  }, { schemaRecord: { _: '_' }, metaRecords: []})

  return [ records.schemaRecord, ...records.metaRecords ]
}

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
