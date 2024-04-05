import { expand } from "@fetsorn/csvs-js";
import {
  schemaSync,
  schemaRemote,
  schemaRSS,
  schemaLocal,
  schemaZip,
  schemaTG,
} from "../layout/profile_view/components/dispenser/components/index.js";

export function generateDefaultRepoRecord() {
  const recordCondensed = {
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
        trunk: "datum",
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
    ],
  };

  const recordExpanded = expand(recordCondensed);

  return recordExpanded
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
  ...schemaSync,
  ...schemaRemote,
  ...schemaRSS,
  ...schemaLocal,
  ...schemaZip,
  ...schemaTG,
};
