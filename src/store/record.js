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
  readLocalTags,
  writeRemoteTags,
  writeLocalTags,
} from "@/store/tags.js";
import schemaRoot from "@/store/default_root_schema.json";

export function newUUID() {
  return sha256(uuidv4());
}

export async function deleteRecord(repo, record) {
  await api.deleteRecord(repo, record);

  await api.commit(repo);
}

export async function updateRepo(recordNew) {
  // won't save root/branch-trunk.csv to disk as it's read from repo/_-_.csv
  // TODO move this outside and merge updateRepo with updateEntry
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

export async function updateEntry(repo, recordNew) {
  await api.updateRecord(repo, recordNew);

  await api.commit(repo);
}

export async function readSchema(uuid) {
  if (uuid === "root") {
    return schemaRoot;
  }

  const [schemaRecord] = await api.select(uuid, { _: "_" });

  const branchRecords = await api.select(uuid, { _: "branch" });

  const schema = recordsToSchema(schemaRecord, branchRecords);

  return schema;
}

export async function createRoot() {
  try {
    // fails if root exists
    await api.createRepo("root");

    const branchRecords = schemaToBranchRecords(schemaRoot);

    for (const branchRecord of branchRecords) {
      await api.updateRecord("root", branchRecord);
    }

    await api.commit("root");
  } catch {
    // do nothing
  }
}

// clone or populate repo, write git state
export async function saveRepoRecord(record) {
  const repoUUID = record.repo;

  // extract schema record with trunks from branch records
  const [schemaRecord, ...metaRecords] = extractSchemaRecords(record.branch);

  // create repo directory
  const reponame = Array.isArray(record.reponame)
    ? record.reponame[0]
    : record.reponame;

  await api.createRepo(repoUUID, reponame);

  await api.createLFS(repoUUID);

  // write schema to repo
  await api.updateRecord(repoUUID, schemaRecord);

  for (const metaRecord of metaRecords) {
    await api.updateRecord(repoUUID, metaRecord);
  }

  // write remotes to .git/config
  await writeRemoteTags(repoUUID, record.remote_tag);

  // write locals to .git/config
  await writeLocalTags(repoUUID, record.local_tag);

  await api.commit(repoUUID);

  return undefined;
}

// load git state and schema from folder into the record
export async function loadRepoRecord(record) {
  const repoUUID = record.repo;

  const [schemaRecord] = await api.select(repoUUID, { _: "_" });

  // query {_:branch}
  const metaRecords = await api.select(repoUUID, { _: "branch" });

  // add trunk field from schema record to branch records
  const branchRecords = enrichBranchRecords(schemaRecord, metaRecords);

  const branchPartial = { branch: branchRecords };

  const tagsRemote = await readRemoteTags(repoUUID);

  // get remote
  const tagsRemotePartial =
    tagsRemote.length > 0 ? { remote_tag: tagsRemote } : {};

  const tagsLocal = await readLocalTags(repoUUID);

  // get locals
  const tagsLocalPartial = tagsLocal.length > 0 ? { local_tag: tagsLocal } : {};

  const recordNew = {
    ...record,
    ...branchPartial,
    ...tagsRemotePartial,
    ...tagsLocalPartial,
  };

  return recordNew;
}
