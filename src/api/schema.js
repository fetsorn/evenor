import { v4 as uuidv4 } from "uuid";
import { sha256 } from "js-sha256";

export const schemaRoot = {
  repo: {
    trunks: [],
    leaves: [ "reponame", "category", "branch", "local_tag", "remote_tag", "sync_tag" ],
    description: {
      en: "Dataset",
      ru: "Проект",
    },
  },
  reponame: {
    trunks: [ "repo" ],
    leaves: [],
    description: {
      en: "Name of the dataset",
      ru: "Название проекта",
    },
  },
  category: {
    trunks: [ "repo" ],
    leaves: [],
    description: {
      en: "Category of the dataset",
      ru: "Категория проекта",
    },
  },
  branch: {
    trunks: [ "repo" ],
    leaves: [ "trunk", "task", "cognate", "description_en", "description_ru" ],
    description: {
      en: "Branch name",
      ru: "Название ветки",
    },
  },
  trunk: {
    trunks: [ "branch" ],
    leaves: [],
    description: {
      en: "Branch trunk",
      ru: "Ствол ветки",
    },
  },
  task: {
    trunks: [ "branch" ],
    leaves: [],
    description: {
      en: "Branch task",
      ru: "Предназначение ветки",
    },
  },
  cognate: {
    trunks: [ "branch" ],
    leaves: [],
    description: {
      en: "Branch cognate",
      ru: "Родственная ветка",
    },
  },
  description_en: {
    trunks: [ "branch" ],
    leaves: [],
    description: {
      en: "Branch description EN",
      ru: "Описание ветки на английском",
    },
  },
  description_ru: {
    trunks: [ "branch" ],
    leaves: [],
    description: {
      en: "Branch description RU",
      ru: "Описание ветки на русском",
    },
  },
  local_tag: {
    trunks: [ "repo" ],
    leaves: [],
    task: "directory",
    description: {
      en: "Path to asset archive",
      ru: "Путь к локальному архиву",
    },
  },
  remote_tag: {
    trunks: [ "repo" ],
    leaves: [ "remote_url", "remote_token" ],
    task: "remote",
    description: {
      en: "Name of git repository",
      ru: "Название git репозитория",
    },
  },
  remote_url: {
    trunks: [ "remote_tag" ],
    leaves: [],
    description: {
      en: "URL to git repository",
      ru: "Путь к git репозиторию",
    },
  },
  remote_token: {
    trunks: [ "remote_tag" ],
    leaves: [],
    description: {
      en: "Authentication token",
      ru: "Токен для синхронизации",
    },
  },
  sync_tag: {
    trunks: [ "repo" ],
    leaves: [ "sync_tag_search" ],
    task: "sync",
    description: {
      en: "Name of database to sync",
      ru: "Название базы данных для синхронизации",
    },
  },
  sync_tag_search: {
    trunks: [ "sync_tag" ],
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
      description_en: "Category",
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

export function newUUID() {
  return sha256(uuidv4());
}

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

      const schemaRecord = leaves.length > 0
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
    const relationsPartial = schemaRelations.reduce((accTrunk, [trunk, leaves]) => {
      // if old is array, [ ...old, new ]
      // if old is string, [ old, new ]
      // is old is undefined, [ new ]
      const trunkPartial = leaves.includes(branch) ? [trunk] : [];

      const leavesPartial = trunk === branch ? leaves : [];

      return ({
        trunks: [...accTrunk.trunks, ...trunkPartial],
        leaves: [...accTrunk.leaves, ...leavesPartial]
      });
    }, { trunks: [], leaves: [] });

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
