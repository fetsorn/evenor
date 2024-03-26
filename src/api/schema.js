import { digestMessage, randomUUID } from "@fetsorn/csvs-js";
import {
  schemaSync,
  schemaRemote,
  schemaRSS,
  schemaLocal,
  schemaZip,
  schemaTG,
} from "../layout/profile_view/components/dispenser/components/index.js";

export function recordToSchema(schemaRecord) {
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

export async function schemaToRecord(schema) {
  const record = {
    _: "schema",
    UUID: await digestMessage(await randomUUID()),
    schema_branch: [],
  };

  await Promise.all(
    Object.keys(schema).map(async (key) => {
      const item = {};

      item._ = "schema_branch";

      item.schema_branch = key;

      if (schema[key].trunk) {
        item.schema_branch_trunk = schema[key].trunk;
      }

      if (schema[key].task) {
        item.schema_branch_task = schema[key].task;
      }

      if (schema[key].description) {
        if (schema[key].description.en) {
          item.schema_branch_description_en = schema[key].description.en;
        }

        if (schema[key].description.ru) {
          item.schema_branch_description_ru = schema[key].description.ru;
        }
      }

      record.items.push(item);
    }),
  );

  return record;
}

export async function generateDefaultSchemaRecord() {
  return {
    _: "schema",
    schema: await digestMessage(await randomUUID()),
    schema_branch: [
      {
        _: "schema_branch",
        schema_branch: "files",
        schema_branch_trunk: [
          { _: "schema_branch_trunk", schema_branch_trunk: "datum" },
        ],
        schema_branch_description_en: [
          {
            _: "schema_branch_description_en",
            schema_branch_description_en: "Digital assets",
          },
        ],
        schema_branch_description_ru: [
          {
            _: "schema_branch_description_ru",
            schema_branch_description_ru: "Файлы",
          },
        ],
      },
      {
        _: "schema_branch",
        schema_branch: "file",
        schema_branch_trunk: [
          { _: "schema_branch_trunk", schema_branch_trunk: "files" },
        ],
        schema_branch_task: [
          { _: "schema_branch_task", schema_branch_task: "file" },
        ],
        schema_branch_description_en: [
          {
            _: "schema_branch_description_en",
            schema_branch_description_en: "Digital asset",
          },
        ],
        schema_branch_description_ru: [
          {
            _: "schema_branch_description_ru",
            schema_branch_description_ru: "Файл",
          },
        ],
      },
      {
        _: "schema_branch",
        schema_branch: "filename",
        schema_branch_trunk: [
          { _: "schema_branch_trunk", schema_branch_trunk: "file" },
        ],
        schema_branch_task: [
          { _: "schema_branch_task", schema_branch_task: "filename" },
        ],
        schema_branch_description_en: [
          {
            _: "schema_branch_description_en",
            schema_branch_description_en: "Path to a digital asset",
          },
        ],
        schema_branch_description_ru: [
          {
            _: "schema_branch_description_ru",
            schema_branch_description_ru: "Путь к файлу",
          },
        ],
      },
      {
        _: "schema_branch",
        schema_branch: "actdate",
        schema_branch_trunk: [
          { _: "schema_branch_trunk", schema_branch_trunk: "datum" },
        ],
        schema_branch_task: [
          { _: "schema_branch_task", schema_branch_task: "date" },
        ],
        schema_branch_description_en: [
          {
            _: "schema_branch_description_en",
            schema_branch_description_en: "Date of the event",
          },
        ],
        schema_branch_description_ru: [
          {
            _: "schema_branch_description_ru",
            schema_branch_description_ru: "Дата события",
          },
        ],
      },
      {
        _: "schema_branch",
        schema_branch: "datum",
        schema_branch_task: [
          { _: "schema_branch_task", schema_branch_task: "text" },
        ],
        schema_branch_description_en: [
          {
            _: "schema_branch_description_en",
            schema_branch_description_en: "Description of the event",
          },
        ],
        schema_branch_description_ru: [
          {
            _: "schema_branch_description_ru",
            schema_branch_description_ru: "Описание события",
          },
        ],
      },
      {
        _: "schema_branch",
        schema_branch: "saydate",
        schema_branch_trunk: [
          { _: "schema_branch_trunk", schema_branch_trunk: "datum" },
        ],
        schema_branch_task: [
          { _: "schema_branch_task", schema_branch_task: "date" },
        ],
        schema_branch_description_en: [
          {
            _: "schema_branch_description_en",
            schema_branch_description_en: "Date of record",
          },
        ],
        schema_branch_description_ru: [
          {
            _: "schema_branch_description_ru",
            schema_branch_description_ru: "Дата записи",
          },
        ],
      },
      {
        _: "schema_branch",
        schema_branch: "filehash",
        schema_branch_trunk: [
          { _: "schema_branch_trunk", schema_branch_trunk: "file" },
        ],
        schema_branch_task: [
          { _: "schema_branch_task", schema_branch_task: "filehash" },
        ],
        schema_branch_description_en: [
          {
            _: "schema_branch_description_en",
            schema_branch_description_en: "Hashsum of the file",
          },
        ],
        schema_branch_description_ru: [
          {
            _: "schema_branch_description_ru",
            schema_branch_description_ru: "Хэш файла",
          },
        ],
      },
      {
        _: "schema_branch",
        schema_branch: "category",
        schema_branch_trunk: [
          { _: "schema_branch_trunk", schema_branch_trunk: "datum" },
        ],
        schema_branch_description_en: [
          {
            _: "schema_branch_description_en",
            schema_branch_description_en: "Category",
          },
        ],
        schema_branch_description_ru: [
          {
            _: "schema_branch_description_ru",
            schema_branch_description_ru: "Категория",
          },
        ],
      },
      {
        _: "schema_branch",
        schema_branch: "privacy",
        schema_branch_trunk: [
          { _: "schema_branch_trunk", schema_branch_trunk: "datum" },
        ],
        schema_branch_description_en: [
          {
            _: "schema_branch_description_en",
            schema_branch_description_en: "Privacy",
          },
        ],
        schema_branch_description_ru: [
          {
            _: "schema_branch_description_ru",
            schema_branch_description_ru: "Публичность",
          },
        ],
      },
      {
        _: "schema_branch",
        schema_branch: "actname",
        schema_branch_trunk: [
          { _: "schema_branch_trunk", schema_branch_trunk: "datum" },
        ],
        schema_branch_description_en: [
          {
            _: "schema_branch_description_en",
            schema_branch_description_en: "Name of the person in the event",
          },
        ],
        schema_branch_description_ru: [
          {
            _: "schema_branch_description_ru",
            schema_branch_description_ru:
              "Имя человека участвовавшего в событии",
          },
        ],
      },
      {
        _: "schema_branch",
        schema_branch: "sayname",
        schema_branch_trunk: [
          { _: "schema_branch_trunk", schema_branch_trunk: "datum" },
        ],
        schema_branch_description_en: [
          {
            _: "schema_branch_description_en",
            schema_branch_description_en:
              "Name of the person who made the record",
          },
        ],
        schema_branch_description_ru: [
          {
            _: "schema_branch_description_ru",
            schema_branch_description_ru: "Имя автора записи",
          },
        ],
      },
    ],
  };
}

export const defaultSchema = {
  datum: {
    task: "text",
    description: {
      en: "Description of the event",
      ru: "Описание события",
    },
  },
  hostdate: {
    trunk: "datum",
    task: "date",
    description: {
      en: "Date of the event",
      ru: "Дата события",
    },
  },
  hostname: {
    trunk: "datum",
    description: {
      en: "Name of the person in the event",
      ru: "Имя человека участвовавшего в событии",
    },
  },
  guestdate: {
    trunk: "datum",
    task: "date",
    description: {
      en: "Date of record",
      ru: "Дата записи",
    },
  },
  guestname: {
    trunk: "datum",
    description: {
      en: "Name of the person who made the record",
      ru: "Имя автора записи",
    },
  },
  category: {
    trunk: "datum",
    description: {
      en: "Category",
      ru: "Категория",
    },
  },
  privacy: {
    trunk: "datum",
    description: {
      en: "Privacy",
      ru: "Публичность",
    },
  },
  files: {
    trunk: "datum",
    description: {
      en: "Digital assets",
      ru: "Файлы",
    },
  },
  file: {
    trunk: "files",
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
  filehash: {
    trunk: "file",
    task: "filehash",
    description: {
      en: "Hash of a digital asset",
      ru: "Хеш файла",
    },
  },
};

const schemaSchema = {
  schema: {
    trunk: "reponame",
    description: {
      en: "Schema of the repo",
      ru: "Структура проекта",
    },
  },
  schema_branch: {
    trunk: "schema",
    description: {
      en: "Branch name",
      ru: "Название ветки",
    },
  },
  schema_branch_trunk: {
    trunk: "schema_branch",
    description: {
      en: "Branch trunk",
      ru: "Ствол ветки",
    },
  },
  schema_branch_task: {
    trunk: "schema_branch",
    description: {
      en: "Branch task",
      ru: "Предназначение ветки",
    },
  },
  schema_branch_description_en: {
    trunk: "schema_branch_description",
    description: {
      en: "Branch description EN",
      ru: "Описание ветки на английском",
    },
  },
  schema_branch_description_ru: {
    trunk: "schema_branch_description",
    description: {
      en: "Branch description RU",
      ru: "Описание ветки на русском",
    },
  },
};

export const schemaRoot = {
  reponame: {
    description: {
      en: "Name of the repo",
      ru: "Название проекта",
    },
  },
  category: {
    trunk: "reponame",
    description: {
      en: "Category of the repo",
      ru: "Категория проекта",
    },
  },
  ...schemaSchema,
  tags: {
    trunk: "reponame",
  },
  ...schemaSync,
  ...schemaRemote,
  ...schemaRSS,
  ...schemaLocal,
  ...schemaZip,
  ...schemaTG,
};
