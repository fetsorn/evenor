import {
  API,
} from "../api/index.js";

import { digestMessage, randomUUID, expand } from "@fetsorn/csvs-js";

export async function newUUID() {
  return digestMessage(await randomUUID())
}

async function readRemoteTags(repoUUID, record) {
  const api = new API(repoUUID);

  try {
    const remotes = await api.listRemotes();

    const tags = await Promise.all(remotes.map(async (remoteName) => {
      const [remoteUrl, remoteToken] = await api.getRemote(remoteName);

      const tag = {
        _: "remote_tag",
        UUID: await newUUID(),
        remote_name: remoteName,
        remote_url: remoteUrl,
        remote_token: remoteToken,
      };

      return tag;
    }));

    return tags;
  } catch {
    // do nothing
  }

  return {}
}

async function readLocalTags(repoUUID, record) {
  const api = new API(repoUUID);

  try {
    const assetPaths = await api.listAssetPaths();

    const tags = await Promise.all(assetPaths.map(async (assetPath) => {
      const tag = {
        _: "local_tag",
        UUID: await newUUID(),
        local_path: assetPath,
      }

      return tag
    }))

    return tags
  } catch {
    // do nothing
  }

  return {}
}

// turns [{_:_, branch1: branch2}, {_:branch, branch: "branch2", task: "date"}]
// into [{_:branch, branch: "branch2", trunk: "branch1", task: "date"}]
function enrichBranchRecords(schemaRecord, metaRecords) {
  const schemaRecordExpanded = expand(schemaRecord);

  // TODO validate against the case when branch has multiple trunks
  return metaRecords.map((branchRecord) => {
    const { branch } = branchRecord;

    const trunk = Object.keys(schemaRecord).find(
      (key) => schemaRecordExpanded[key].includes(branch)
    );

    const trunkPartial = trunk !== undefined
          ? { trunk }
          : {};

    return { ...branchRecord, ...trunkPartial }
  })
}


// { entry: { description: { en: "", ru: "" } }, datum: { trunk: "entry" } }
function schemaToPartial(schema) {
  const branches = Object.keys(schema).map((key) => {
    const trunkPartial = schema[key].trunk ? { trunk: schema[key].trunk } : {};

    const taskPartial = schema[key].task ? { task: schema[key].task } : {};

    const enPartial = schema[key].description?.en ? {
      description_en: schema[key].description.en
    } : {};

    const ruPartial = schema[key].description?.ru ? {
      description_ru: schema[key].description.ru
    } : {};

    const descriptionPartial = schema[key].description ? {
      ...enPartial,
      ...ruPartial,
    } : {};

    const item = {
      _: "branch",
      branch: key,
      ...trunkPartial,
      ...taskPartial,
      ...descriptionPartial,
    };

    return item;
  });

  return { branch: branches };
}

// load git state and schema from dataset into the record
export async function loadRepoRecord(repoUUID, record) {
  const remoteTags = await readRemoteTags(repoUUID, record);

  const localTags = await readLocalTags(repoUUID, record);

  const api = new API(repoUUID);

  // const schema = await api.readSchema();

  // const branchPartial = await schemaToPartial(schema);

  const [ schemaRecord ] = await api.select(new URLSearchParams("?_=_"));
  // query {_:branch}
  const metaRecords = await api.select(new URLSearchParams("?_=branch"));

  const branchRecords = enrichBranchRecords(schemaRecord, metaRecords);

  const branchPartial = { branch: branchRecords };

  const recordNew = {
    ...branchPartial,
    ...remoteTags,
    ...localTags,
    ...record
  };

  return recordNew
}

// TODO collapse into api.ensure
async function clone(repoUUID, record) {
  //const api = new API(repoUUID);

  // TODO: replace with new tag schema
  //const remoteTags =
  //  record.tags?.items?.filter((item) => item._ === "remote_tag") ?? [];

  //for (const remoteTag of remoteTags) {
  //  // try to clone project to repo directory if record has a remote tag,
  //  // will fail if repo exists
  //  try {
  //    // const [remoteTag] = remoteTags;

  //    await api.clone(remoteTag.remote_url, remoteTag.remote_token);

  //    const schema = await api.readSchema();

  //    return { schema, ...record }
  //  } catch {
  //    // do nothing
  //  }
  //}

  return record
}

async function writeGitTags(repoUUID, record) {
  //const api = new API(repoUUID);

  //const remoteTags =
  //  record.tags?.items?.filter((item) => item._ === "remote_tag") ?? [];

  //for (const remoteTag of remoteTags) {
  //  try {
  //    api.addRemote(
  //      remoteTag.remote_name,
  //      remoteTag.remote_url,
  //      remoteTag.remote_token,
  //    );
  //  } catch {
  //    // do nothing
  //  }
  //}

  //const localTags =
  //  record.tags?.items?.filter((item) => item._ === "local_tag") ?? [];

  //for (const localTag of localTags) {
  //  try {
  //    api.addAssetPath(localTag.local_path);
  //  } catch {
  //    // do nothing
  //  }
  //}
}

function omitRepoRecord(record) {
  // omit to not save schema branch to csvs
  // eslint-disable-next-line
  const { schema: omitSchema, ...recordNew } = record;

  // TODO fix tags accessor for new schema
  //const tagsFiltered = recordNew.tags?.filter(
  //  (item) => item._ !== "remote_tag" && item._ !== "local_tag"
  //);

  //const tags = tagsFiltered
  //      ? { tags: tagsFiltered }
  //      : {};

  return {
    // ...tags,
    ...recordNew
  }
}

// turns [{_:branch, branch: "branch2", trunk: "branch1", task: "date"}]
// into [{_:_, branch1: branch2}, {_:branch, branch: "branch2", task: "date"}]
function extractSchemaRecords(branchRecords) {
  const records = branchRecords.reduce((acc, branchRecord) => {
    const { trunk, ...branchRecordOmitted } = branchRecord;

    const accLeaves = acc.schemaRecord[trunk] ?? [];

    const schemaRecord = trunk !== undefined
          ? { ...acc.schemaRecord, [trunk]: [ branchRecord.branch, ...accLeaves ] }
          : acc.schemaRecord;

    const metaRecords = [ branchRecordOmitted, ...acc.metaRecords ];

    return { schemaRecord, metaRecords }
  }, { schemaRecord: { _: '_' }, metaRecords: []});

  return [ records.schemaRecord, ...records.metaRecords ]
}

// clone or populate repo, write git state
export async function saveRepoRecord(repoUUID, record) {
  // TODO check if there is a dataset with given repoUUID

  // TODO clone only if there is no repo
  // or collapse into api.ensure
  const recordNew = await clone(repoUUID, record);

  const apiRoot = new API("root");

  await apiRoot.updateRecord(recordNew);

  const api = new API(repoUUID);

  // create repo directory with a schema
  await api.ensure(recordNew.reponame);

  const records = extractSchemaRecords(recordNew.branch);

  for (const record of records) {
    await api.updateRecord(record, []);
  }

  await writeGitTags(repoUUID, recordNew);

  await api.commit();

  const recordOmitted = omitRepoRecord(recordNew);

  return recordOmitted;
}

// pick a param to group data by
export function getDefaultSortBy(schema, data, searchParams) {
  // fallback to sortBy param from the search query
  if (searchParams.has(".sort")) {
    const sortBy = searchParams.get(".sort");

    return sortBy;
  }

  let sortBy;

  const car = data[0] ?? {};

  // fallback to first date param present in data
  sortBy = Object.keys(schema).find(
    (branch) =>
      schema[branch].task === "date" &&
      Object.prototype.hasOwnProperty.call(car, branch),
  );

  // fallback to first param present in data
  if (!sortBy) {
    sortBy = Object.keys(schema).find((branch) =>
      Object.prototype.hasOwnProperty.call(car, branch),
    );
  }

  // fallback to first date param present in schema
  if (!sortBy) {
    sortBy = Object.keys(schema).find(
      (branch) => schema[branch].task === "date",
    );
  }

  // fallback to first param present in schema
  if (!sortBy) {
    [sortBy] = Object.keys(schema);
  }

  // unreachable with a valid scheme
  if (!sortBy) {
    throw Error("failed to find default sortBy in the schema");
  }

  return sortBy;
}

export function queriesToParams(queries) {
  const searchParams = new URLSearchParams();

  Object.keys(queries).map((key) =>
    queries[key] === "" ? null : searchParams.set(key, queries[key]),
  );

  return searchParams;
}

export function paramsToQueries(searchParams) {
  const searchParamsObject = Array.from(searchParams).reduce(
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

// { entry: { description: { en: "", ru: "" } }, datum: { trunk: "entry" } }
// [ {_: "_", entry: [ "datum" ]},
//   {_: branch, branch: "entry", description_en: "", description_ru: ""},
//   {_: branch, branch: "datum"}
// ]
export function schemaToBranchRecords(schema) {
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
