import api from "../api/index.js";

export function newUUID() {
  return sha256(uuidv4());
}

export async function deleteRecord(repo, record) {
  await api.deleteRecord(repo, record);

  await api.commit(repo);
}

export async function updateRepo(recordNew) {
  // won't save root/branch-trunk.csv to disk as it's read from repo/_-_.csv
  const branchesPartial =
    recordNew.branch !== undefined
      ? {
          branches: recordNew.branch.map(
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

export async function writeRemotes(uuid, tags) {
  if (tags) {
    const tagsList = Array.isArray(tags) ? tags : [tags];

    for (const tag of tagsList) {
      try {
        await api.addRemote(
          uuid,
          tag.remote_tag,
          tag.remote_url[0],
          tag.remote_token,
        );
      } catch (e) {
        console.log(e);
        // do nothing
      }
    }
  }
}

export async function writeLocals(uuid, tags) {
  if (tags) {
    const tagList = Array.isArray(tags) ? tags : [tags];

    for (const tag of tagList) {
      try {
        api.addAssetPath(uuid, tag);
      } catch {
        // do nothing
      }
    }
  }
}

// clone or populate repo, write git state
export async function saveRepoRecord(record) {
  const repoUUID = record.repo;

  // extract schema record with trunks from branch records
  const [schemaRecord, ...metaRecords] = extractSchemaRecords(record.branch);

  const schema = recordsToSchema(schemaRecord, metaRecords);

  // create repo directory with a schema
  // TODO record.reponame is a list, iterate over items
  // TODO what if record.reponame is undefined
  await api.createRepo(repoUUID, record.reponame[0]);

  await api.createLFS(repoUUID);

  await api.updateRecord(repoUUID, schemaRecord);

  for (const metaRecord of metaRecords) {
    await api.updateRecord(repoUUID, metaRecord);
  }

  // write remotes to .git/config
  await writeRemotes(repoUUID, record.remote_tag);

  // write locals to .git/config
  await writeLocals(repoUUID, record.local_tag);

  await api.commit(repoUUID);

  return;
}

export async function readRemotes(uuid) {
  try {
    const remotes = await api.listRemotes(uuid);

    const remoteTags = await Promise.all(
      remotes.map(async (remoteName) => {
        const [remoteUrl, remoteToken] = await api.getRemote(uuid, remoteName);

        const partialToken = remoteToken ? { remote_token: remoteToken } : {};

        return {
          _: "remote_tag",
          remote_name: remoteName,
          remote_url: remoteUrl,
          ...partialToken,
        };
      }),
    );

    return { remote_tag: remoteTags };
  } catch {
    return {};
  }
}

export async function readLocals(uuid) {
  try {
    const locals = await api.listAssetPaths(uuid);

    return locals.reduce(
      (acc, local) => {
        const tagsLocalOld = acc.local_tag;

        return { ...acc, remote_tag: [...tagsLocalOld, local] };
      },
      { local_tag: [] },
    );
  } catch {
    return {};
  }
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

  // get remote
  const tagsRemotePartial = await readRemotes(repoUUID);

  // get locals
  const tagsLocalPartial = await readLocals(repoUUID);

  const recordNew = {
    ...record,
    ...branchPartial,
    ...tagsRemotePartial,
    ...tagsLocalPartial,
  };

  return recordNew;
}
