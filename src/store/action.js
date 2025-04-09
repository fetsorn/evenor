import history from "history/hash";
import api from "../api/index.js";
import { v4 as uuidv4 } from "uuid";
import { sha256 } from "js-sha256";
import {
  isTwig,
  extractSchemaRecords,
  enrichBranchRecords,
  recordsToSchema,
  schemaToBranchRecords,
  queriesToParams,
} from "./pure.js";
import schemaRoot from "./schema_root.json";
import defaultRepoRecord from "./default_repo_record.json";

async function cloneAndOpen(searchParams) {
  // if uri specifies a remote
  // try to clone remote to store
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

    await get().onRecordUpdate({}, recordClone);

    return { schema: schemaClone, repo: repoClone };
  } catch (e) {
    // proceed to choose root repo uuid
    console.log(e);
  }
}

async function findAndOpen(repoRoute) {
  // if repo is in store, find uuid in root folder
  try {
    const [repo] = await api.select("root", { _: "repo", reponame: repoRoute });

    const { repo: repoUUID } = repo;

    const schema = await readSchema(repoUUID);

    return { schema, repo };
  } catch {
    // proceed to set repo uuid as root
  }
}

async function readRemotes(uuid) {
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

async function readLocals(uuid) {
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

async function writeRemotes(uuid, tags) {
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

async function writeLocals(uuid, tags) {
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

export async function readSchema(uuid) {
  if (uuid === "root") {
    return schemaRoot;
  }

  const [schemaRecord] = await api.select(uuid, { _: "_" });

  const branchRecords = await api.select(uuid, { _: "branch" });

  const schema = recordsToSchema(schemaRecord, branchRecords);

  return schema;
}

export async function repoFromUrl() {
  const searchParams = new URLSearchParams(history.location.search);

  const repoRoute = history.location.pathname.replace("/", "");

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

export function queriesFromUrl() {
  const searchParams = new URLSearchParams(history.location.search);

  const repoRoute = history.location.pathname.replace("/", "");

  const sortByURL = searchParams.get(".sortBy");

  function paramsToQueries(searchParamsSet) {
    const searchParamsObject = Array.from(searchParamsSet).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {},
    );

    const queries = Object.fromEntries(
      Object.entries(searchParamsObject).filter(
        ([key]) => key !== "~" && key !== "-" && !key.startsWith("."),
      ),
    );

    return queries;
  }

  // convert to object, skip reserved fields
  const queries = paramsToQueries(searchParams);

  const base = queries._ ?? "repo";

  // TODO pick default sortBy from task === "date"
  const sortBy = sortByURL ?? base;

  return { ...queries, _: base, ".sortBy": sortBy };
}

export function changeQueries(schema, queries, field, value) {
  if (field === ".sortBy" || field === ".sortDirection") {
    return { ...queries, [field]: value };
  }

  // if query field is undefined, delete queries
  if (field === undefined) {
    return {};
  } else if (field === "_") {
    // if query field is base, update default sort by
    // TODO pick default sortBy from task === "date"
    const sortBy = value;

    return { _: value, ".sortBy": sortBy };
  } else if (field !== "") {
    // if query field is defined, update queries
    if (value === undefined) {
      // if query value is undefined, remove query field
      const { [field]: omit, ...queriesWithoutField } = queries;

      return queriesWithoutField;
    } else {
      // if query value is defined, set query field
      return { ...queries, [field]: value };
    }
  }

  return queries;
}

export async function changeRepo(uuid, baseNew) {
  if (uuid === "root") {
    return {
      repo: { _: "repo", repo: uuid },
      schema: schemaRoot,
      queries: { _: "repo", ".sortBy": "reponame" },
    };
  } else {
    const [repo] = await api.select("root", { _: "repo", repo: uuid });

    const schema = await readSchema(uuid);

    const base = baseNew ?? getDefaultBase(schema);

    // TODO pick default sortBy from task === "date"
    const sortBy = base;

    return {
      repo,
      schema,
      queries: { _: base, ".sortBy": sortBy },
    };
  }
}

export function setURL(queries, base, sortBy, repoUUID, reponame) {
  const searchParams = queriesToParams(queries);

  searchParams.set("_", base);

  if (sortBy) {
    searchParams.set(".sortBy", sortBy);
  }

  const pathname = repoUUID === "root" ? "#" : `#/${reponame}`;

  const searchStringNew = searchParams.toString();

  const urlNew = `${pathname}?${searchStringNew}`;

  window.history.replaceState(null, null, urlNew);

  return searchParams;
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

export function newUUID() {
  return sha256(uuidv4());
}
