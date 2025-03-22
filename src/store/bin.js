import history from "history/hash";
import { API } from "../api/index.js";
import { findCrown } from "@fetsorn/csvs-js";
import { v4 as uuidv4 } from "uuid";
import { sha256 } from "js-sha256";

/**
 * This function is true when branch has no leaves
 * @name isTwig
 * @function
 * @param {object} schema - Dataset schema.
 * @param {object} record - An expanded record.
 * @returns {object} - A condensed record.
 */
export function isTwig(schema, branch) {
  return (
    Object.keys(schema).filter((b) => schema[b].trunks.includes(branch))
      .length === 0
  );
}

export const schemaRoot = {
  repo: {
    trunks: [],
    leaves: [
      "reponame",
      "category",
      "branch",
      "local_tag",
      "remote_tag",
      "sync_tag",
    ],
    description: {
      en: "Dataset",
      ru: "Проект",
    },
  },
  reponame: {
    trunks: ["repo"],
    leaves: [],
    description: {
      en: "Name of the dataset",
      ru: "Название проекта",
    },
  },
  category: {
    trunks: ["repo"],
    leaves: [],
    description: {
      en: "Category of the dataset",
      ru: "Категория проекта",
    },
  },
  branch: {
    trunks: ["repo"],
    leaves: ["trunk", "task", "cognate", "description_en", "description_ru"],
    description: {
      en: "Branch name",
      ru: "Название ветки",
    },
  },
  trunk: {
    trunks: ["branch"],
    leaves: [],
    description: {
      en: "Branch trunk",
      ru: "Ствол ветки",
    },
  },
  task: {
    trunks: ["branch"],
    leaves: [],
    description: {
      en: "Branch task",
      ru: "Предназначение ветки",
    },
  },
  cognate: {
    trunks: ["branch"],
    leaves: [],
    description: {
      en: "Branch cognate",
      ru: "Родственная ветка",
    },
  },
  description_en: {
    trunks: ["branch"],
    leaves: [],
    description: {
      en: "Branch description EN",
      ru: "Описание ветки на английском",
    },
  },
  description_ru: {
    trunks: ["branch"],
    leaves: [],
    description: {
      en: "Branch description RU",
      ru: "Описание ветки на русском",
    },
  },
  local_tag: {
    trunks: ["repo"],
    leaves: [],
    task: "directory",
    description: {
      en: "Path to asset archive",
      ru: "Путь к локальному архиву",
    },
  },
  remote_tag: {
    trunks: ["repo"],
    leaves: ["remote_url", "remote_token"],
    task: "remote",
    description: {
      en: "Name of git repository",
      ru: "Название git репозитория",
    },
  },
  remote_url: {
    trunks: ["remote_tag"],
    leaves: [],
    description: {
      en: "URL to git repository",
      ru: "Путь к git репозиторию",
    },
  },
  remote_token: {
    trunks: ["remote_tag"],
    leaves: [],
    description: {
      en: "Authentication token",
      ru: "Токен для синхронизации",
    },
  },
  sync_tag: {
    trunks: ["repo"],
    leaves: ["sync_tag_search"],
    task: "sync",
    description: {
      en: "Name of database to sync",
      ru: "Название базы данных для синхронизации",
    },
  },
  sync_tag_search: {
    trunks: ["sync_tag"],
    leaves: [],
    description: {
      en: "Search query",
      ru: "Поисковый запрос",
    },
  },
};

export const defaultRepoRecord = {
  _: "repo",
  reponame: "",
  branch: [
    {
      _: "branch",
      branch: "event",
      description_en: "Record",
      description_ru: "Запись",
    },
    {
      _: "branch",
      branch: "datum",
      trunk: "event",
      task: "text",
      description_en: "Description of the event",
      description_ru: "Описание события",
    },
    {
      _: "branch",
      branch: "actdate",
      trunk: "event",
      task: "date",
      description_en: "Date of the event",
      description_ru: "Дата события",
    },
    {
      _: "branch",
      branch: "actname",
      trunk: "event",
      description_en: "Name of the person in the event",
      description_ru: "Имя человека участвовавшего в событии",
      cognate: ["sayname", "person", "parent"],
    },
    {
      _: "branch",
      branch: "saydate",
      trunk: "event",
      task: "date",
      description_en: "Date of record",
      description_ru: "Дата записи",
    },
    {
      _: "branch",
      branch: "person",
      cognate: ["sayname", "actname", "parent"],
    },
    {
      _: "branch",
      branch: "parent",
      trunk: "person",
      cognate: ["sayname", "actname", "person"],
    },
    {
      _: "branch",
      branch: "sayname",
      trunk: "event",
      description_en: "Name of the person who made the record",
      description_ru: "Имя автора записи",
      cognate: ["actname", "person", "parent"],
    },
    {
      _: "branch",
      branch: "category",
      trunk: "event",
      description_en: "Category of the dataset",
      description_ru: "Категория",
    },
    {
      _: "branch",
      branch: "privacy",
      trunk: "event",
      description_en: "Privacy",
      description_ru: "Публичность",
    },
    {
      _: "branch",
      branch: "file",
      trunk: "event",
      task: "file",
      description_en: "Digital asset",
      description_ru: "Файл",
    },
    {
      _: "branch",
      branch: "filename",
      trunk: "file",
      task: "filename",
      description_en: "Name of digital asset",
      description_ru: "Название файла",
    },
    {
      _: "branch",
      branch: "fileext",
      trunk: "file",
      task: "fileext",
      description_en: "Extension of the file",
      description_ru: "Расширение файла",
    },
    {
      _: "branch",
      branch: "filehash",
      trunk: "file",
      task: "filehash",
      description_en: "Hashsum of the file",
      description_ru: "Хэш файла",
    },
    {
      _: "branch",
      branch: "branch",
      description_en: "Branch name",
      description_ru: "Название ветки",
    },
    {
      _: "branch",
      branch: "trunk",
      trunk: "branch",
      description_en: "Branch trunk",
      description_ru: "Ствол ветки",
    },
    {
      _: "branch",
      branch: "task",
      trunk: "branch",
      description_en: "Branch task",
      description_ru: "Предназначение ветки",
    },
    {
      _: "branch",
      branch: "cognate",
      trunk: "branch",
      description_en: "Branch cognate",
      description_ru: "Родственная ветка",
    },
    {
      _: "branch",
      branch: "description_en",
      trunk: "branch",
      description_en: "Branch description EN",
      description_ru: "Описание ветки на английском",
    },
    {
      _: "branch",
      branch: "description_ru",
      trunk: "branch",
      description_en: "Branch description RU",
      description_ru: "Описание ветки на русском",
    },
  ],
};

// turn
// { event: { description: { en: "", ru: "" } }, datum: { trunk: "event" } }
// into
// [ {_: "_", event: [ "datum" ]},
//   {_: branch, branch: "event", description_en: "", description_ru: ""},
//   {_: branch, branch: "datum"}
// ]
export function schemaToBranchRecords(schema) {
  const branches = Object.keys(schema);

  const records = branches.reduce(
    (acc, branch) => {
      const { leaves, task, cognate, description } = schema[branch];

      const schemaRecord =
        leaves.length > 0
          ? { ...acc.schemaRecord, [branch]: leaves }
          : acc.schemaRecord;

      const partialEn =
        description && description.en ? { description_en: description.en } : {};

      const partialRu =
        description && description.ru ? { description_ru: description.ru } : {};

      const partialTask = task ? { task } : {};

      const partialCognate = cognate ? { cognate } : {};

      const metaRecords = [
        {
          _: "branch",
          branch,
          ...partialTask,
          ...partialCognate,
          ...partialEn,
          ...partialRu,
        },
        ...acc.metaRecords,
      ];

      return { schemaRecord, metaRecords };
    },
    { schemaRecord: { _: "_" }, metaRecords: [] },
  );

  return [records.schemaRecord, ...records.metaRecords];
}

// pick a param to group data by
export function getDefaultSortBy(schema, base, records) {
  // TODO rewrite to const and tertials
  let sortBy;

  const crown = findCrown(schema, base);

  const record = records[0] ?? {};

  // fallback to first date param present in data
  sortBy = crown.find(
    (branch) => schema[branch].task === "date" && Object.hasOwn(record, branch),
  );

  // fallback to first param present in data
  if (!sortBy) {
    sortBy = crown.find((branch) => Object.hasOwn(record, branch));
  }

  // fallback to first date param present in schema
  if (!sortBy) {
    sortBy = crown.find((branch) => schema[branch].task === "date");
  }

  // fallback to first param present in schema
  if (!sortBy) {
    [sortBy] = crown;
  }

  // unreachable with a valid scheme
  if (!sortBy) {
    return base;
    // throw Error("failed to find default sortBy in the schema");
  }

  return sortBy;
}

export function queriesToParams(queriesObject) {
  const searchParams = new URLSearchParams();

  Object.keys(queriesObject).map((key) =>
    queriesObject[key] === ""
      ? null
      : searchParams.set(key, queriesObject[key]),
  );

  return searchParams;
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

/**
 * This returns an array of records from the dataset.
 * @name searchParamsToQuery
 * @export function
 * @param {URLSearchParams} urlSearchParams - search params from a query string.
 * @returns {Object}
 */
export function searchParamsToQuery(schema, searchParams) {
  // TODO rewrite to schemaRecord
  const urlSearchParams = new URLSearchParams(searchParams.toString());

  if (!urlSearchParams.has("_")) return {};

  const base = urlSearchParams.get("_");

  urlSearchParams.delete("_");

  urlSearchParams.delete("__");

  const entries = Array.from(urlSearchParams.entries());

  // TODO: if key is leaf, add it to value of trunk
  const query = entries.reduce(
    (acc, [branch, value]) => {
      // TODO: can handly only two levels of nesting, suffices for compatibility
      // push to [trunk]: { [key]: [ value ] }

      const trunk1 =
        schema[branch] !== undefined ? schema[branch].trunks[0] : undefined;

      if (trunk1 === base || branch === base) {
        return { ...acc, [branch]: value };
      }

      const trunk2 =
        schema[trunk1] !== undefined ? schema[trunk1].trunks[0] : undefined;

      if (trunk2 === base) {
        const trunk1Record = acc[trunk1] ?? { _: trunk1 };

        return { ...acc, [trunk1]: { ...trunk1Record, [branch]: value } };
      }

      const trunk3 =
        schema[trunk2] !== undefined ? schema[trunk2].trunks[0] : undefined;

      if (trunk3 === base) {
        const trunk2Record = acc[trunk2] ?? { _: trunk2 };

        const trunk1Record = trunk2Record[trunk1] ?? { _: trunk1 };

        return {
          ...acc,
          [trunk2]: {
            ...trunk2Record,
            [trunk1]: {
              ...trunk1Record,
              [branch]: value,
            },
          },
        };
      }

      return acc;
    },
    { _: base },
  );

  return query;
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
  const searchString = history.location.search;

  const searchParams = new URLSearchParams(searchString);

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

  const repoRoute = history.location.pathname.replace("/", "");

  const base = queries._ ?? "repo";

  const sortBy = sortByURL ?? getDefaultSortBy(schemaRoot, base, []);

  return { queries, base, sortBy };
}

export function baz(queries, field, value) {
  if (field === ".sortBy") {
    queries[field] = value;

    return queries;
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
      delete queries[field];
    } else {
      // if query value is defined, set query field
      queries[field] = value;
    }

    return queries;
  }

  return queries;
}

export function newUUID() {
  return sha256(uuidv4());
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

// add trunk field from schema record to branch records
// turn { _: _, branch1: [ branch2 ] }, [{ _: branch, branch: "branch2", task: "date" }]
// into [{ _: branch, branch: "branch2", trunk: "branch1", task: "date" }]
export function enrichBranchRecords(schemaRecord, metaRecords) {
  // [[branch1, [branch2]]]
  const schemaRelations = Object.entries(schemaRecord).filter(
    ([key]) => key !== "_",
  );

  // list of unique branches in the schema
  const branches = [...new Set(schemaRelations.flat(Infinity))];

  const branchRecords = branches.reduce((accBranch, branch) => {
    // check each key of schemaRecord, if array has branch, push trunk to metaRecord.trunks
    const relationsPartial = schemaRelations.reduce(
      (accTrunk, [trunk, leaves]) => {
        // if old is array, [ ...old, new ]
        // if old is string, [ old, new ]
        // is old is undefined, [ new ]
        const trunkPartial = leaves.includes(branch) ? [trunk] : [];

        const leavesPartial = trunk === branch ? leaves : [];

        return {
          trunks: [...accTrunk.trunks, ...trunkPartial],
          leaves: [...accTrunk.leaves, ...leavesPartial],
        };
      },
      { trunks: [], leaves: [] },
    );

    const branchPartial = { _: "branch", branch };

    const metaPartial =
      metaRecords.find((record) => record.branch === branch) ?? {};

    // if branch has no trunks, it's a root
    if (relationsPartial.trunks.length === 0) {
      const rootRecord = { ...branchPartial, ...metaPartial };

      return [...accBranch, rootRecord];
    }

    const branchRecord = {
      ...branchPartial,
      ...metaPartial,
      ...relationsPartial,
    };

    return [...accBranch, branchRecord];
  }, []);

  return branchRecords;
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

// extract schema record with trunks from branch records
// turn [{ _: branch, branch: "branch2", trunk: "branch1", task: "date" }]
// into [{ _: _, branch1: branch2 }, { _: branch, branch: "branch2", task: "date" }]
export function extractSchemaRecords(branchRecords) {
  const records = branchRecords.reduce(
    (acc, branchRecord) => {
      const { trunk, ...branchRecordOmitted } = branchRecord;

      const accLeaves = acc.schemaRecord[trunk] ?? [];

      const schemaRecord =
        trunk !== undefined
          ? {
              ...acc.schemaRecord,
              [trunk]: [branchRecord.branch, ...accLeaves],
            }
          : acc.schemaRecord;

      const metaRecords = [branchRecordOmitted, ...acc.metaRecords];

      return { schemaRecord, metaRecords };
    },
    { schemaRecord: { _: "_" }, metaRecords: [] },
  );

  return [records.schemaRecord, ...records.metaRecords];
}

// turn
// { _: "_", event: [ "datum" ] },
// [ { _: branch, branch: "event", description_en: "", description_ru: "" },
//   { _: branch, branch: "datum" }
// ]
// into
// { event: { description: { en: "", ru: "" } }, datum: { trunk: "event" } }
export function recordsToSchema(schemaRecord, metaRecords) {
  // [[branch1, [branch2]]]
  const schemaRelations = Object.entries(schemaRecord).filter(
    ([key]) => key !== "_",
  );

  // list of unique branches in the schema
  const branches = [...new Set(schemaRelations.flat(Infinity))];

  const schema = branches.reduce((accBranch, branch) => {
    const relationsPartial = schemaRelations.reduce(
      (accTrunk, [trunk, leaves]) => {
        // if old is array, [ ...old, new ]
        // if old is string, [ old, new ]
        // is old is undefined, [ new ]
        const trunkPartial = leaves.includes(branch) ? [trunk] : [];

        const leavesPartial = trunk === branch ? leaves : [];

        return {
          trunks: [...accTrunk.trunks, ...trunkPartial],
          leaves: [...accTrunk.leaves, ...leavesPartial],
        };
      },
      { trunks: [], leaves: [] },
    );

    const metaRecord =
      metaRecords.find((record) => record.branch === branch) ?? {};

    const { task, cognate, description_en, description_ru } = metaRecord;

    const taskPartial = task !== undefined ? { task } : {};

    const cognatePartial = cognate !== undefined ? { cognate } : {};

    const enPartial =
      description_en !== undefined ? { en: description_en } : undefined;

    const ruPartial =
      description_ru !== undefined ? { ru: description_ru } : undefined;

    const descriptionPartial =
      enPartial || ruPartial
        ? { description: { ...enPartial, ...ruPartial } }
        : {};

    const branchPartial = {
      [branch]: {
        ...relationsPartial,
        ...taskPartial,
        ...cognatePartial,
        ...descriptionPartial,
      },
    };

    return { ...accBranch, ...branchPartial };
  }, {});

  return schema;
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
