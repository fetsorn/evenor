import {
  readRemoteTags,
  //readLocalTags,
  writeRemoteTags,
  //writeLocalTags,
} from "@/proxy/tags.js";
import {
  extractSchemaRecords,
  enrichBranchRecords,
  schemaToBranchRecords,
  recordsToSchema,
} from "@/proxy/pure.js";
import { clone } from "@/proxy/open.js";
import schemaRoot from "@/proxy/default_root_schema.json";

/**
 * This
 * @name readSchema
 * @export function
 * @param {String} mind -
 * @returns {object}
 */
export async function readSchema(api, mind) {
  if (mind === "root") {
    return schemaRoot;
  }

  const [schemaRecord] = await api.select(mind, { _: "_" });

  const branchRecords = await api.select(mind, { _: "branch" });

  const schema = recordsToSchema(schemaRecord, branchRecords);

  return schema;
}

/**
 * This
 * @name sync
 * @export function
 * @param {String} mind
 * @param {String} remoteUrl
 * @param {String} remoteToken
 */
export async function resolve(api, mind) {
  console.log("[proxy] resolve", { mind });
  const tagsRemote = await readRemoteTags(api, mind);

  let resolveResult = { ok: true };

  for (const tagRemote of tagsRemote) {
    const resolvePartial = await api.resolve(mind, {
      url: tagRemote.origin_url,
      token: tagRemote.origin_token,
    });

    resolveResult.ok = resolveResult.ok && resolvePartial.ok;
  }

  console.log("[proxy] resolve", { mind, resolveResult });

  return resolveResult;
}

/**
 * This loads git state and schema from folder into the record
 * @name loadMindRecord
 * @export function
 * @param {object} record
 * @returns {object}
 */
export async function loadMindRecord(api, record) {
  const mind = record.mind;

  const [schemaRecord] = await api.select(mind, { _: "_" });

  // query {_:branch}
  const metaRecords = await api.select(mind, { _: "branch" });

  // add trunk field from schema record to branch records
  const branchRecords = enrichBranchRecords(schemaRecord, metaRecords);

  const branchPartial = { branch: branchRecords };

  const tagsRemote = await readRemoteTags(api, mind);

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

async function mindIsNew(api, mind) {
  const query = {
    _: "mind",
    mind,
  };

  // find mind in root folder
  const mindRecords = await api.select("root", query);

  return mindRecords === undefined || mindRecords.length === 0;
}

/**
 * This writes schema and git state
 * @name saveMindRecord
 * @export function
 * @param {object} record
 */
export async function saveMindRecord(api, record) {
  console.log("[proxy] saveMindRecord", {
    mind: record.mind,
    name: record.name,
    hasOrigin: !!record.origin_url,
  });
  const mind = record.mind;

  // create mind directory
  const name = Array.isArray(record.name) ? record.name[0] : record.name;

  const origin = Array.isArray(record.origin_url)
    ? record.origin_url[0]
    : record.origin_url;

  // if record has origin_url it can be cloned
  const hasURL = origin !== undefined && origin.origin_url !== undefined;

  // search root for mind
  const isNew = await mindIsNew(api, mind);

  // TODO this is not strictly correct because if clone fails
  // it should fall through to the initialization

  console.log("[proxy] saveMindRecord", { hasURL, isNew, mind });

  if (hasURL && isNew) {
    console.log("[proxy] saveMindRecord: cloning", {
      mind,
      url: origin.origin_url,
    });
    // pass a uuid to clone so that it can clone to proper place
    const recordClone = await clone(
      api,
      mind,
      origin.origin_url,
      origin.origin_token,
    );

    const recordNew = { ...recordClone, mind };

    await updateMind(api, recordNew);

    // if there is no such mind
    //if (mindExists === false) {
    //} else {
    //  // TODO if there is such remote, do nothing
    //  // TODO if this is a new remote, ask user
    //  // TODO if user rejects, do nothing
    //  // TODO if user approves write new remote to mind
    //}

    console.log("[proxy] saveMindRecord: clone done", { mind });
    // no need to write schema or init since clone has everything
    return undefined;
  }

  if (isNew) {
    try {
      await updateMind(api, record);

      // fails if exists
      await api.gitinit(mind, name);

      await api.csvsinit(mind);

      //await api.createLFS(mind);
    } catch (e) {
      // EEXIST if repo is in fs but not root dataset
      // should never happen
      console.log(e);
    }
  } else {
    console.log("repo exists, renaming");
    await updateMind(api, record);

    await api.rename(mind, name);
  }

  // extract schema record with trunks from branch records
  const [schemaRecord, ...metaRecords] = extractSchemaRecords(record.branch);

  // write schema to mind
  await api.updateRecord(mind, schemaRecord);

  for (const metaRecord of metaRecords) {
    await api.updateRecord(mind, metaRecord);
  }

  // write remotes to .git/config
  await writeRemoteTags(api, mind, record.origin_url);

  // write locals to .git/config
  //await writeLocalTags(mind, record.local_tag);

  await api.commit(mind);

  return undefined;
}

/**
 * This
 * @name deleteRecord
 * @export function
 * @param {object} mind -
 * @param {object} record -
 */
export async function deleteRecord(api, mind, record) {
  await api.deleteRecord(mind, record);

  await api.commit(mind);
}

/**
 * This
 * @name updateMind
 * @export function
 * @param {object} recordNew -
 */
export async function updateMind(api, recordNew) {
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
export async function updateEntry(api, mind, recordNew) {
  await api.updateRecord(mind, recordNew);

  await api.commit(mind);
}

// TODO rename to differ from solidjs "createRoot"
/**
 * This
 * @name createRoot
 * @export function
 */
export async function createRoot(api) {
  try {
    // fails if root exists
    await api.gitinit("root");

    await api.csvsinit("root");

    const branchRecords = schemaToBranchRecords(schemaRoot);

    for (const branchRecord of branchRecords) {
      await api.updateRecord("root", branchRecord);
    }

    await api.commit("root");
  } catch (e) {
    if (e.message === "EEXIST") {
      console.log("root exists");
    } else {
      console.log(e);
    }
    // do nothing
  }
}
