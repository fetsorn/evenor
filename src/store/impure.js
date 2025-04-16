import { v4 as uuidv4 } from "uuid";
import api from "../api/index.js";
import { sha256 } from "js-sha256";
import {
  extractSchemaRecords,
  enrichBranchRecords,
  recordsToSchema,
  schemaToBranchRecords,
} from "./pure.js";

export function newUUID() {
  return sha256(uuidv4());
}

export async function deleteRecord(repo, record) {
  await api.deleteRecord(repo, record);

  await api.commit(repo);
}

export async function foo(repo, base, recordNew) {
  const isHomeScreen = repo === "root";

  const isRepoBranch = base === "repo";

  const canSaveRepo = isHomeScreen && isRepoBranch;

  // won't save root/branch-trunk.csv to disk as it's read from repo/_-_.csv
  if (canSaveRepo) {
    const branches = recordNew["branch"].map(
      ({ trunk, ...branchWithoutTrunk }) => branchWithoutTrunk,
    );

    const recordPruned = { ...recordNew, branch: branches };

    await api.updateRecord(repo, recordPruned);
  } else {
    await api.updateRecord(repo, recordNew);
  }

  await api.commit(repo);

  if (canSaveRepo) {
    await saveRepoRecord(recordNew);
  }
}

export async function createRecord(repo, base) {
  const isHomeScreen = repo === "root";

  const isRepoBranch = base === "repo";

  const isRepoRecord = isHomeScreen && isRepoBranch;

  const repoPartial = isRepoRecord ? defaultRepoRecord : {};

  const record = {
    _: base,
    [base]: await newUUID(),
    ...repoPartial,
  };

  return record;
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

export async function cloneAndOpen(searchParams) {
  // if uri specifies a remote
  // try to clone remote
  // where repo uuid is a digest of remote
  // and repo name is uri-encoded remote
  const remote = searchParams.get("~");

  const token = searchParams.get("-") ?? "";

  const repoUUIDRemote = await digestMessage(remote);

  try {
    // TODO rimraf the folder if it already exists

    await api.cloneView(repoUUIDRemote, remote, token);

    // TODO add new repo to root
    // TODO return a repo record

    const pathname = new URL(remote).pathname;

    // get repo name from remote
    const reponameClone = pathname.substring(pathname.lastIndexOf("/") + 1);

    const schemaClone = await readSchema(repoUUIDRemote);

    const [schemaRecordClone, ...metaRecordsClone] =
      schemaToBranchRecords(schemaClone);

    const branchRecordsClone = enrichBranchRecords(
      schemaRecordClone,
      metaRecordsClone,
    );

    const recordClone = {
      _: "repo",
      repo: repoUUIDRemote,
      reponame: reponameClone,
      branch: branchRecordsClone,
      remote_tag: {
        _: "remote_tag",
        remote_tag: "",
        remote_token: token,
        remote_url: remote,
      },
    };

    await saveRecord("root", "repo", [], {}, recordClone);

    return { schema: schemaClone, repo: repoClone };
  } catch (e) {
    // proceed to choose root repo uuid
    console.log(e);
  }
}

export async function findAndOpen(repoRoute) {
  // find uuid in root folder
  try {
    const [repo] = await api.select("root", { _: "repo", reponame: repoRoute });

    const { repo: repoUUID } = repo;

    const schema = await readSchema(repoUUID);

    return { schema, repo };
  } catch {
    // proceed to set repo uuid as root
  }
}

export async function repoFromURL(search, pathname) {
  const searchParams = new URLSearchParams(search);

  const repoRoute = pathname.replace("/", "");

  const root = { schema: schemaRoot, repo: { _: "repo", repo: "root" } };

  if (searchParams.has("~")) {
    // clone from remote and open
    try {
      return cloneAndOpen(searchParams);
    } catch (e) {
      console.log(e);
      // TODO set url to root

      return root;
    }
  }

  if (repoRoute !== "") {
    // open
    try {
      return findAndOpen(repoRoute);
    } catch (e) {
      console.log(e);
      // TODO set url to root

      return root;
    }
  }

  return root;
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

export async function findRecord(schema, repo, appendRecord, searchParams) {
  // prepare a controller to stop the new stream
  let isAborted = false;

  const abortController = new AbortController();

  function abortPreviousStream() {
    isAborted = true;

    abortController.abort();
  }

  // remove all evenor-specific searchParams before passing to csvs
  const searchParamsWithoutCustom = new URLSearchParams(
    searchParams.entries().filter(([key]) => !key.startsWith(".")),
  );

  const query = searchParamsToQuery(schema, searchParamsWithoutCustom);

  // prepare a new stream
  const { strm: fromStrm, closeHandler } = await api.selectStream(repo, query);

  const isHomeScreen = repo === "root";

  // create a stream that appends to records
  const toStrm = new WritableStream({
    async write(chunk) {
      if (isAborted) {
        return;
      }

      // when selecting a repo, load git state and schema from folder into the record
      const record = isHomeScreen ? await loadRepoRecord(chunk) : chunk;

      appendRecord(record);
    },

    abort() {
      // stream interrupted
      // no need to await on the promise, closing api stream for cleanup
      closeHandler();
    },
  });

  async function startStream() {
    return fromStrm.pipeTo(toStrm, { signal: abortController.signal });
  }

  return { abortPreviousStream, startStream };
}
