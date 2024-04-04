import { digestMessage, randomUUID, expand, condense } from "@fetsorn/csvs-js";
import {
  schemaSync,
  schemaRemote,
  schemaRSS,
  schemaLocal,
  schemaZip,
  schemaTG,
} from "../layout/profile_view/components/dispenser/components/index.js";

export function recordToSchema(schemaRecord) {
  // TODO: rewrite to destructuring and ternaries
  const schemaObject = {};

  for (const item of schemaRecord.schema_branch) {
    const branch = item.schema_branch;

    schemaObject[branch] = {};

    if (item.schema_branch_trunk) {
      schemaObject[branch].trunk = item.schema_branch_trunk;
    }

    if (item.schema_branch_type) {
      schemaObject[branch].type = item.schema_branch_type;
    }

    if (item.schema_branch_task) {
      schemaObject[branch].task = item.schema_branch_task;
    }

    if (item.schema_branch_dir) {
      schemaObject[branch].dir = item.schema_branch_dir;
    }

    if (item.schema_branch_description) {
      schemaObject[branch].description = {};

      if (item.schema_branch_description_en) {
        schemaObject[branch].description.en = item.schema_branch_description_en;
      }

      if (item.schema_branch_description_ru) {
        schemaObject[branch].description.ru = item.schema_branch_description_ru;
      }
    }
  }

  return schemaObject;
}

export function schemaToRecord(schema) {
  const schema_branches = Object.keys(schema).map((key) => {
    const trunk = schema[key].trunk ? { schema_branch_trunk: schema[key].trunk } : {};

    const task = schema[key].task ? { schema_branch_task: schema[key].task } : {};

    const description_en = schema[key].description?.en ? {
      schema_branch_description_en: schema[key].description.en
    } : {};

    const description_ru = schema[key].description?.ru ? {
      schema_branch_description_ru: schema[key].description.ru
    } : {};

    const description = schema[key].description ? {
      ...description_en,
      ...description_ru,
    } : {};

    const item = {
      _: "schema_branch",
      schema_branch: key,
      ...trunk,
      ...task,
      ...description,
    };

    return item;
  });

  return record;
}

export async function generateDefaultSchemaRecord() {
  const recordCondensed = {
    _: "schema",
    schema: await digestMessage(await randomUUID()),
    schema_branch: [
      {
        _: "schema_branch",
        schema_branch: "entry",
        schema_branch_description_en: "Record",
        schema_branch_description_ru: "Запись",
      },
      {
        _: "schema_branch",
        schema_branch: "datum",
        schema_branch_trunk: "entry",
        schema_branch_task: "text",
        schema_branch_description_en: "Description of the event",
        schema_branch_description_ru: "Описание события",
      },
      {
        _: "schema_branch",
        schema_branch: "actdate",
        schema_branch_trunk: "datum",
        schema_branch_task: "date",
        schema_branch_description_en: "Date of the event",
        schema_branch_description_ru: "Дата события",
      },
      {
        _: "schema_branch",
        schema_branch: "actname",
        schema_branch_trunk: "entry",
        schema_branch_description_en: "Name of the person in the event",
        schema_branch_description_ru: "Имя человека участвовавшего в событии",
      },
      {
        _: "schema_branch",
        schema_branch: "saydate",
        schema_branch_trunk: "entry",
        schema_branch_task: "date",
        schema_branch_description_en: "Date of record",
        schema_branch_description_ru: "Дата записи",
      },
      {
        _: "schema_branch",
        schema_branch: "sayname",
        schema_branch_trunk: "entry",
        schema_branch_description_en: "Name of the person who made the record",
        schema_branch_description_ru: "Имя автора записи",
      },
      {
        _: "schema_branch",
        schema_branch: "category",
        schema_branch_trunk: "entry",
        schema_branch_description_en: "Category",
        schema_branch_description_ru: "Категория",
      },
      {
        _: "schema_branch",
        schema_branch: "privacy",
        schema_branch_trunk: "entry",
        schema_branch_description_en: "Privacy",
        schema_branch_description_ru: "Публичность",
      },
      {
        _: "schema_branch",
        schema_branch: "file",
        schema_branch_trunk: "entry",
        schema_branch_task: "file",
        schema_branch_description_en: "Digital asset",
        schema_branch_description_ru: "Файл",
      },
      {
        _: "schema_branch",
        schema_branch: "filename",
        schema_branch_trunk: "file",
        schema_branch_task: "filename",
        schema_branch_description_en: "Path to a digital asset",
        schema_branch_description_ru: "Путь к файлу",
      },
      {
        _: "schema_branch",
        schema_branch: "fileext",
        schema_branch_trunk: "file",
        schema_branch_task: "fileext",
        schema_branch_description_en: "Extension of the file",
        schema_branch_description_ru: "Расширение файла",
      },
      {
        _: "schema_branch",
        schema_branch: "filehash",
        schema_branch_trunk: "file",
        schema_branch_task: "filehash",
        schema_branch_description_en: "Hashsum of the file",
        schema_branch_description_ru: "Хэш файла",
      },
    ],
  };

  const recordExpanded = expand(recordCondensed);

  return recordExpanded
}

export const defaultSchema = {
  entry: {
    description: {
      en: "Entry",
      ru: "Запись",
    },
  },
  datum: {
    trunk: "entry",
    task: "text",
    description: {
      en: "Description of the event",
      ru: "Описание события",
    },
  },
  actdate: {
    trunk: "entry",
    task: "date",
    description: {
      en: "Date of the event",
      ru: "Дата события",
    },
  },
  actname: {
    trunk: "entry",
    description: {
      en: "Name of the person in the event",
      ru: "Имя человека участвовавшего в событии",
    },
  },
  saydate: {
    trunk: "entry",
    task: "date",
    description: {
      en: "Date of record",
      ru: "Дата записи",
    },
  },
  sayname: {
    trunk: "entry",
    description: {
      en: "Name of the person who made the record",
      ru: "Имя автора записи",
    },
  },
  category: {
    trunk: "entry",
    description: {
      en: "Category",
      ru: "Категория",
    },
  },
  privacy: {
    trunk: "entry",
    description: {
      en: "Privacy",
      ru: "Публичность",
    },
  },
  file: {
    trunk: "entry",
    task: "file",
    description: {
      en: "Digital asset",
      ru: "Файл",
    },
  },
  filename: {
    trunk: "file",
    task: "filename",
    description: {
      en: "Path to a digital asset",
      ru: "Путь к файлу",
    },
  },
  fileext: {
    trunk: "file",
    task: "fileext",
    description: {
      en: "Extension of the file",
      ru: "Расширение файла",
    },
  },
  filehash: {
    trunk: "file",
    task: "filehash",
    description: {
      en: "Hash of a digital asset",
      ru: "Хеш файла",
    },
  },
};

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
