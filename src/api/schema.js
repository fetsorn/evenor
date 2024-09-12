import { v4 as uuidv4 } from "uuid";
import { sha256 } from "js-sha256";

export const schemaRoot = {
  repo: {
    description: {
      en: "Dataset",
      ru: "Проект",
    },
  },
  reponame: {
    trunk: "repo",
    description: {
      en: "Name of the dataset",
      ru: "Название проекта",
    },
  },
  category: {
    trunk: "repo",
    description: {
      en: "Category of the dataset",
      ru: "Категория проекта",
    },
  },
  branch: {
    trunk: "repo",
    description: {
      en: "Branch name",
      ru: "Название ветки",
    },
  },
  trunk: {
    trunk: "branch",
    description: {
      en: "Branch trunk",
      ru: "Ствол ветки",
    },
  },
  task: {
    trunk: "branch",
    description: {
      en: "Branch task",
      ru: "Предназначение ветки",
    },
  },
  cognate: {
    trunk: "branch",
    description: {
      en: "Branch cognate",
      ru: "Родственная ветка",
    },
  },
  description_en: {
    trunk: "branch",
    description: {
      en: "Branch description EN",
      ru: "Описание ветки на английском",
    },
  },
  description_ru: {
    trunk: "branch",
    description: {
      en: "Branch description RU",
      ru: "Описание ветки на русском",
    },
  },
  local_tag: {
    trunk: "repo",
    task: "directory",
    description: {
      en: "Path to asset archive",
      ru: "Путь к локальному архиву",
    },
  },
  remote_tag: {
    trunk: "repo",
    task: "remote",
    description: {
      en: "Name of git repository",
      ru: "Название git репозитория",
    },
  },
  remote_url: {
    trunk: "remote_tag",
    description: {
      en: "URL to git repository",
      ru: "Путь к git репозиторию",
    },
  },
  remote_token: {
    trunk: "remote_tag",
    description: {
      en: "Authentication token",
      ru: "Токен для синхронизации",
    },
  },
  sync_tag: {
    trunk: "repo",
    task: "sync",
    description: {
      en: "Name of database to sync",
      ru: "Название базы данных для синхронизации",
    },
  },
  sync_tag_search: {
    trunk: "sync_tag",
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
      const { trunk, task, cognate, description } = schema[branch];

      const accLeaves = acc.schemaRecord[trunk] ?? [];

      const schemaRecord =
        trunk !== undefined
          ? { ...acc.schemaRecord, [trunk]: [branch, ...accLeaves] }
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
    const trunkPartial = schemaRelations.reduce((accTrunk, [trunk, leaves]) => {
      if (leaves.includes(branch)) {
        // if old is array, [ ...old, new ]
        // if old is string, [ old, new ]
        // is old is undefined, [ new ]
        const trunks = accTrunk.trunk
          ? [accTrunk.trunk, trunk].flat(Infinity)
          : trunk;

        return { trunk: trunks };
      }

      return accTrunk;
    }, {});

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
        ...trunkPartial,
        ...taskPartial,
        ...cognatePartial,
        ...descriptionPartial,
      },
    };

    return { ...accBranch, ...branchPartial };
  }, {});

  return schema;
}
