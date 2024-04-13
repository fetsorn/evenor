import { findCrown } from "@fetsorn/csvs-js";
import { API, enrichBranchRecords, extractSchemaRecords } from "../api/index.js";
import {
  dispenserHookAfterLoad,
  dispenserHookBeforeSave,
  dispenserHookAfterSave
} from "../components/index.js";

export function getDefaultBase(schema) {
  // find a sane default branch to select
  const base = Object.keys(schema).find(
    (branch) => {
      // does not have a trunk
      const isRoot = !Object.prototype.hasOwnProperty.call(schema[branch], "trunk");

      // not the metadata schema branch
      const isData = branch !== "branch";

      return isRoot && isData
    }
  );

  return base
}

// pick a param to group data by
export function getDefaultSortBy(schema, base, records) {
  // TODO rewrite to const and tertials
  let sortBy;

  const crown = findCrown(schema, base);

  const record = records[0] ?? {};

  // fallback to first date param present in data
  sortBy = crown.find(
    (branch) =>
      schema[branch].task === "date" &&
      Object.prototype.hasOwnProperty.call(record, branch),
  );

  // fallback to first param present in data
  if (!sortBy) {
    sortBy = crown.find((branch) =>
      Object.prototype.hasOwnProperty.call(record, branch),
    );
  }

  // fallback to first date param present in schema
  if (!sortBy) {
    sortBy = crown.find(
      (branch) => schema[branch].task === "date",
    );
  }

  // fallback to first param present in schema
  if (!sortBy) {
    [sortBy] = crown;
  }

  // unreachable with a valid scheme
  if (!sortBy) {
    return base
    // throw Error("failed to find default sortBy in the schema");
  }

  return sortBy;
}

// load git state and schema from dataset into the record
export async function loadRepoRecord(repoUUID, record) {
  const api = new API(repoUUID);

  const [ schemaRecord ] = await api.select(new URLSearchParams("?_=_"));
  // query {_:branch}
  const metaRecords = await api.select(new URLSearchParams("?_=branch"));

  // add trunk field from schema record to branch records
  const branchRecords = enrichBranchRecords(schemaRecord, metaRecords);

  const branchPartial = { branch: branchRecords };

  const dispenserPartial = await dispenserHookAfterLoad(repoUUID, record);

  const recordNew = {
    ...record,
    ...branchPartial,
    ...dispenserPartial,
  };

  return recordNew
}

// clone or populate repo, write git state
export async function saveRepoRecord(repoUUID, record) {
  const recordNew = await dispenserHookBeforeSave(repoUUID, record);

  const apiRoot = new API("root");

  await apiRoot.updateRecord(recordNew);

  const api = new API(repoUUID);

  // create repo directory with a schema
  await api.ensure(recordNew.reponame);

  // extract schema record with trunks from branch records
  const records = extractSchemaRecords(recordNew.branch);

  for (const record of records) {
    await api.updateRecord(record, []);
  }

  await api.commit();

  await dispenserHookAfterSave(repoUUID, recordNew);

  const { schema: omitSchema, ...recordOmitted } = recordNew;

  return recordOmitted;
}
