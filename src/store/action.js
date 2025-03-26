import history from "history/hash";
import { API } from "../api/index.js";
import { v4 as uuidv4 } from "uuid";
import { sha256 } from "js-sha256";
import {
  isTwig,
  extractSchemaRecords,
  enrichBranchRecords,
  recordsToSchema,
  schemaToBranchRecords,
  getDefaultSortBy,
  queriesToParams,
  searchParamsToQuery,
} from "./pure.js";
import schemaRoot from "./schema_root.json";
import defaultRepoRecord from "./default_repo_record.json";

async function foobar(searchParams) {
  // if uri specifies a remote
  // try to clone remote to store
  // where repo uuid is a digest of remote
  // and repo name is uri-encoded remote
  const remote = searchParams.get("~");

  const token = searchParams.get("-") ?? "";

  const repoUUIDRemote = await digestMessage(remote);

  try {
    const api = new API(repoUUIDRemote);

    // TODO rimraf the folder if it already exists

    await api.cloneView(remote, token);

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

async function fux(repoRoute) {
  // if repo is in store, find uuid in root folder
  try {
    const [repo] = await apiRoot.select({ _: "repo", reponame: repoRoute });

    const { repo: repoUUID } = repo;

    const api = new API(repoUUID);

    const schema = await readSchema(repoUUID);

    return { schema, repo };
  } catch {
    // proceed to set repo uuid as root
  }
}

async function readRemotes(api) {
  try {
    const remotes = await api.listRemotes();

    const remoteTags = await Promise.all(
      remotes.map(async (remoteName) => {
        const [remoteUrl, remoteToken] = await api.getRemote(remoteName);

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

async function readLocals(api) {
  try {
    const locals = await api.listAssetPaths();

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

async function writeRemotes(api, tags) {
  if (tags) {
    const tagsList = Array.isArray(tags) ? tags : [tags];

    for (const tag of tagsList) {
      try {
        await api.addRemote(
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

async function writeLocals(api, tags) {
  if (tags) {
    const tagList = Array.isArray(tags) ? tags : [tags];

    for (const tag of tagList) {
      try {
        api.addAssetPath(tag);
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

  const api = new API(uuid);

  const [schemaRecord] = await api.select({ _: "_" });

  const branchRecords = await api.select({ _: "branch" });

  const schema = recordsToSchema(schemaRecord, branchRecords);

  return schema;
}

export async function foo() {
  const apiRoot = new API("root");

  await apiRoot.ensure();

  const branchRecords = schemaToBranchRecords(schemaRoot);

  for (const branchRecord of branchRecords) {
    await apiRoot.updateRecord(branchRecord);
  }

  await apiRoot.commit();
}

export function bar() {
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

  const sortBy = sortByURL ?? getDefaultSortBy(schemaRoot, base, []);

  return { ...queries, _: base, ".sortBy": sortBy };
}

export function baz(schema, queries, field, value) {
  if (field === ".sortBy" || field === ".sortDirection") {
    return { ...queries, [field]: value };
  }

  // if query field is undefined, delete queries
  if (field === undefined) {
    return {};
  } else if (field === "_") {
    // if query field is base, update default sort by
    const sortBy = getDefaultSortBy(schema, value, []);

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

export async function bux() {
  const searchParams = new URLSearchParams(history.location.search);

  const repoRoute = history.location.pathname.replace("/", "");

  if (searchParams.has("~")) {
    return foobar(searchParams);
  }

  if (repoRoute !== "") {
    return fux(repoRoute);
  }

  return { schema: schemaRoot, repo: { _: "repo", repo: "root" } };
}

export async function qux(uuid, baseNew) {
  if (uuid === "root") {
    return {
      repo: { _: "repo", repo: uuid },
      schema: schemaRoot,
      queries: { _: "repo", ".sortBy": "reponame" },
    };
  } else {
    const api = new API("root");

    const [repo] = await api.select({ _: "repo", repo: uuid });

    const schema = await readSchema(uuid);

    const base = baseNew ?? getDefaultBase(schema);

    const sortBy = getDefaultSortBy(schema, base, []);

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

  const api = new API(repoUUID);

  const [schemaRecord] = await api.select({ _: "_" });

  // query {_:branch}
  const metaRecords = await api.select({ _: "branch" });

  // add trunk field from schema record to branch records
  const branchRecords = enrichBranchRecords(schemaRecord, metaRecords);

  const branchPartial = { branch: branchRecords };

  // get remote
  const tagsRemotePartial = await readRemotes(api);

  // get locals
  const tagsLocalPartial = await readLocals(api);

  const recordNew = {
    ...record,
    ...branchPartial,
    ...tagsRemotePartial,
    ...tagsLocalPartial,
  };

  return recordNew;
}

// clone or populate repo, write git state
export async function saveRepoRecord(record) {
  const repoUUID = record.repo;

  const api = new API(repoUUID);

  // extract schema record with trunks from branch records
  const [schemaRecord, ...metaRecords] = extractSchemaRecords(record.branch);

  const schema = recordsToSchema(schemaRecord, metaRecords);

  // create repo directory with a schema
  // TODO record.reponame is a list, iterate over items
  // TODO what if record.reponame is undefined
  await api.ensure(record.reponame[0]);

  await api.updateRecord(schemaRecord);

  for (const metaRecord of metaRecords) {
    await api.updateRecord(metaRecord);
  }

  // write remotes to .git/config
  await writeRemotes(api, record.remote_tag);

  // write locals to .git/config
  await writeLocals(api, record.local_tag);

  await api.commit();

  return;
}

export function newUUID() {
  return sha256(uuidv4());
}
