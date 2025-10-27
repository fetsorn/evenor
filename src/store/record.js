import { v4 as uuidv4 } from "uuid";
import { sha256 } from "js-sha256";
import api from "@/api/index.js";
import {
  extractSchemaRecords,
  enrichBranchRecords,
  recordsToSchema,
  schemaToBranchRecords,
} from "@/store/pure.js";
import {
  readRemoteTags,
  //readLocalTags,
  writeRemoteTags,
  //writeLocalTags,
} from "@/store/tags.js";
import schemaRoot from "@/store/default_root_schema.json";

/**
 * This
 * @name newUUID
 * @export function
 * @returns {String}
 */
export function newUUID() {
  return sha256(uuidv4());
}

/**
 * This
 * @name deleteRecord
 * @export function
 * @param {object} mind -
 * @param {object} record -
 */
export async function deleteRecord(mind, record) {
  await api.deleteRecord(mind, record);

  await api.commit(mind);
}

/**
 * This
 * @name updateMind
 * @export function
 * @param {object} recordNew -
 */
export async function updateMind(recordNew) {
  // won't save root/branch-trunk.csv to disk as it's read from mind/_-_.csv
  // TODO move this outside and merge updateMind with updateEntry
  const branchesPartial =
    recordNew.branch !== undefined
      ? {
          branches: recordNew.branch.map(
            // eslint-disable-next-line
            ({ trunk, ...branchWithoutTrunk }) => branchWithoutTrunk,
          ),
        }
      : {};

  const recordPruned = { ...recordNew, ...branchesPartial };

  await api.updateRecord("root", recordPruned);

  await api.commit("root");
}

/**
 * This
 * @name updateEntry
 * @export function
 * @param {object} mind -
 * @param {object} recordNew -
 */
export async function updateEntry(mind, recordNew) {
  await api.updateRecord(mind, recordNew);

  await api.commit(mind);
}

/**
 * This
 * @name readSchema
 * @export function
 * @param {String} mind -
 * @returns {object}
 */
export async function readSchema(mind) {
  if (mind === "root") {
    return schemaRoot;
  }

  const [schemaRecord] = await api.select(mind, { _: "_" });

  const branchRecords = await api.select(mind, { _: "branch" });

  const schema = recordsToSchema(schemaRecord, branchRecords);

  return schema;
}

// TODO rename to differ from solidjs "createRoot"
/**
 * This
 * @name createRoot
 * @export function
 */
export async function createRoot() {
  try {
    // fails if root exists
    await api.init("root");

    const branchRecords = schemaToBranchRecords(schemaRoot);

    for (const branchRecord of branchRecords) {
      await api.updateRecord("root", branchRecord);
    }

    await api.commit("root");
  } catch {
    // do nothing
  }
}

/**
 * This writes schema and git state
 * @name saveMindRecord
 * @export function
 * @param {object} record
 */
export async function saveMindRecord(record) {
  const mind = record.mind;

  // extract schema record with trunks from branch records
  const [schemaRecord, ...metaRecords] = extractSchemaRecords(record.branch);

  // create mind directory
  const name = Array.isArray(record.name) ? record.name[0] : record.name;

  await api.init(mind, name);

  //await api.createLFS(mind);

  // write schema to mind
  await api.updateRecord(mind, schemaRecord);

  for (const metaRecord of metaRecords) {
    await api.updateRecord(mind, metaRecord);
  }

  // write remotes to .git/config
  await writeRemoteTags(mind, record.origin_url);

  // write locals to .git/config
  //await writeLocalTags(mind, record.local_tag);

  await api.commit(mind);

  return undefined;
}

/**
 * This loads git state and schema from folder into the record
 * @name loadMindRecord
 * @export function
 * @param {object} record
 * @returns {object}
 */
export async function loadMindRecord(record) {
  const mind = record.mind;

  const [schemaRecord] = await api.select(mind, { _: "_" });

  // query {_:branch}
  const metaRecords = await api.select(mind, { _: "branch" });

  // add trunk field from schema record to branch records
  const branchRecords = enrichBranchRecords(schemaRecord, metaRecords);

  const branchPartial = { branch: branchRecords };

  const tagsRemote = await readRemoteTags(mind);

  // get remote
  const tagsRemotePartial =
    tagsRemote.length > 0 ? { origin_url: tagsRemote } : {};

  //const tagsLocal = await readLocalTags(mind);

  // get locals
  //const tagsLocalPartial = tagsLocal.length > 0 ? { local_tag: tagsLocal } : {};

  const recordNew = {
    ...record,
    ...branchPartial,
    ...tagsRemotePartial,
    //  ...tagsLocalPartial,
  };

  return recordNew;
}

/**
 * This
 * @name onZip
 * @export function
 * @param {String} mind
 */
export async function onZip(mind) {
  await api.zip(mind);
}

/**
 * This
 * @name sync
 * @export function
 * @param {String} mind
 * @param {String} remoteUrl
 * @param {String} remoteToken
 */
export async function sync(mind) {
  const tagsRemote = await readRemoteTags(mind);

  let syncResult = { ok: true };

  for (const tagRemote of tagsRemote) {
    const syncResultPartial = await api.sync(mind, {
      url: tagRemote.origin_url,
      token: tagRemote.origin_token,
    });

    syncResult.ok = syncResult.ok && syncResultPartial.ok;

    console.log(syncResultPartial, syncResult);
  }

  return syncResult;
}
