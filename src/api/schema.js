import { v4 as uuidv4 } from 'uuid';
import { sha256 } from 'js-sha256';
import {
  schemaDispenser,
} from "../components/index.js";

export function generateDefaultRepoRecord() {
  const record = {
    _: "repo",
    reponame: "",
    branch: [
      {
        _: "branch",
        branch: "entry",
        description_en: "Record",
        description_ru: "Запись",
      },
      {
        _: "branch",
        branch: "datum",
        trunk: "entry",
        task: "text",
        description_en: "Description of the event",
        description_ru: "Описание события",
      },
      {
        _: "branch",
        branch: "actdate",
        trunk: "entry",
        task: "date",
        description_en: "Date of the event",
        description_ru: "Дата события",
      },
      {
        _: "branch",
        branch: "actname",
        trunk: "entry",
        description_en: "Name of the person in the event",
        description_ru: "Имя человека участвовавшего в событии",
      },
      {
        _: "branch",
        branch: "saydate",
        trunk: "entry",
        task: "date",
        description_en: "Date of record",
        description_ru: "Дата записи",
      },
      {
        _: "branch",
        branch: "sayname",
        trunk: "entry",
        description_en: "Name of the person who made the record",
        description_ru: "Имя автора записи",
      },
      {
        _: "branch",
        branch: "category",
        trunk: "entry",
        description_en: "Category",
        description_ru: "Категория",
      },
      {
        _: "branch",
        branch: "privacy",
        trunk: "entry",
        description_en: "Privacy",
        description_ru: "Публичность",
      },
      {
        _: "branch",
        branch: "file",
        trunk: "entry",
        task: "file",
        description_en: "Digital asset",
        description_ru: "Файл",
      },
      {
        _: "branch",
        branch: "filename",
        trunk: "file",
        task: "filename",
        description_en: "Path to a digital asset",
        description_ru: "Путь к файлу",
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
        branch: "task",
        trunk: "branch",
        description_en: "Branch task",
        description_ru: "Предназначение ветки",
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

  return record
}

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
  ...schemaDispenser,
};

export function newUUID() {
  return sha256(uuidv4())
}

// add trunk field from schema record to branch records
// turn [{_:_, branch1: branch2}, {_:branch, branch: "branch2", task: "date"}]
// into [{_:branch, branch: "branch2", trunk: "branch1", task: "date"}]
export function enrichBranchRecords(schemaRecord, metaRecords) {
  // TODO validate against the case when branch has multiple trunks
  return metaRecords.map((branchRecord) => {
    const { branch } = branchRecord;

    const trunk = Object.keys(schemaRecord).find(
      (key) => schemaRecord[key].includes(branch)
    );

    const trunkPartial = trunk !== undefined
          ? { trunk }
          : {};

    return { ...branchRecord, ...trunkPartial }
  })
}

// extract schema record with trunks from branch records
// turn [{_:branch, branch: "branch2", trunk: "branch1", task: "date"}]
// into [{_:_, branch1: branch2}, {_:branch, branch: "branch2", task: "date"}]
export function extractSchemaRecords(branchRecords) {
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

// turn
// { entry: { description: { en: "", ru: "" } }, datum: { trunk: "entry" } }
// into
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

// turn
// [ {_: "_", entry: [ "datum" ]},
//   {_: branch, branch: "entry", description_en: "", description_ru: ""},
//   {_: branch, branch: "datum"}
// ]
// into
// { entry: { description: { en: "", ru: "" } }, datum: { trunk: "entry" } }
export function branchRecordsToSchema(schemaRecord, branchRecords) {
  const trunks = Object.keys(schemaRecord).filter((key) => key !== "_");

  const schemaTrunks = trunks.reduce((accTrunk, trunk) => {
    const accTrunkNew = { ...accTrunk, [trunk]: {} }

    // for each value of trunk, set acc[value].trunk = trunk
    const leaves = schemaRecord[trunk];

    // play differently with description
    return leaves.reduce((accLeaf, leaf) => {
      return { ...accLeaf, [leaf]: { trunk } }
    }, accTrunkNew)
  }, {})

  // TODO validate against the case when branch has multiple trunks
  return branchRecords.reduce((acc, branchRecord) => {
    const { branch, task, description_en, description_ru } = branchRecord;

    const trunk = Object.keys(schemaRecord).find(
      (key) => schemaRecord[key].includes(branch)
    );

    const trunkPartial = trunk !== undefined
          ? { trunk }
          : {};

    const taskPartial = task !== undefined
          ? { task }
          : {};

    const enPartial = description_en !== undefined
          ? { en: description_en }
          : undefined;

    const ruPartial = description_ru !== undefined
          ? { ru: description_ru }
          : undefined;

    const descriptionPartial = enPartial || ruPartial
          ? { description: { ...enPartial, ...ruPartial } }
          : {};

    const branchPartial = {
      [branch]: {...trunkPartial, ...taskPartial, ...descriptionPartial}
    };

    return { ...acc, ...branchPartial }
  }, schemaTrunks)
}
