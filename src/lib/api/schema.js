import { digestMessage, randomUUID } from '@fetsorn/csvs-js';
import { schemaSync, schemaRemote, schemaRSS, schemaLocal } from '../dispensers/index.js';

export function entryToSchema(schemaEntry) {
  const schemaObject = {};

  for (const item of schemaEntry.items) {
    const branch = item.schema_branch_name;

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

      if (item.schema_branch_description.schema_branch_description_en) {
        schemaObject[branch].description.en = item
          .schema_branch_description
          .schema_branch_description_en;
      }

      if (item.schema_branch_description.schema_branch_description_ru) {
        schemaObject[branch].description.ru = item
          .schema_branch_description
          .schema_branch_description_ru;
      }
    }
  }

  return schemaObject;
}

export async function schemaToEntry(schema) {
  const entry = {
    _: 'schema',
    UUID: await digestMessage(await randomUUID()),
    items: [],
  };

  await Promise.all(Object.keys(schema).map(async (key) => {
    const item = {};

    item._ = 'schema_branch';

    item.UUID = await digestMessage(await randomUUID());

    item.schema_branch_name = key;

    if (schema[key].trunk) {
      item.schema_branch_trunk = schema[key].trunk;
    }

    if (schema[key].type) {
      item.schema_branch_type = schema[key].type;
    }

    if (schema[key].task) {
      item.schema_branch_task = schema[key].task;
    }

    if (schema[key].dir) {
      item.schema_branch_dir = schema[key].dir;
    }

    if (schema[key].description) {
      item.schema_branch_description = {
        _: 'schema_branch_description',
        UUID: await digestMessage(await randomUUID()),
      };

      if (schema[key].description.en) {
        item.schema_branch_description
          .schema_branch_description_en = schema[key].description.en;
      }

      if (schema[key].description.ru) {
        item.schema_branch_description
          .schema_branch_description_ru = schema[key].description.ru;
      }
    }

    entry.items.push(item);
  }));

  return entry;
}

export async function generateDefaultSchemaEntry() {
  return {
    _: 'schema',
    UUID: await digestMessage(await randomUUID()),
    items: [
      {
        _: 'schema_branch',
        UUID: await digestMessage(await randomUUID()),
        schema_branch_name: 'files',
        schema_branch_trunk: 'datum',
        schema_branch_type: 'array',
        schema_branch_description: {
          _: 'schema_branch_description',
          UUID: await digestMessage(await randomUUID()),
          schema_branch_description_en: 'Digital assets',
          schema_branch_description_ru: 'Файлы',
        },
      },
      {
        _: 'schema_branch',
        UUID: await digestMessage(await randomUUID()),
        schema_branch_name: 'file',
        schema_branch_trunk: 'files',
        schema_branch_type: 'object',
        schema_branch_task: 'file',
        schema_branch_description: {
          _: 'schema_branch_description',
          UUID: await digestMessage(await randomUUID()),
          schema_branch_description_en: 'Digital asset',
          schema_branch_description_ru: 'Файл',
        },
      },
      {
        _: 'schema_branch',
        UUID: await digestMessage(await randomUUID()),
        schema_branch_name: 'filename',
        schema_branch_trunk: 'file',
        schema_branch_task: 'filename',
        schema_branch_type: 'string',
        schema_branch_description: {
          _: 'schema_branch_description',
          UUID: await digestMessage(await randomUUID()),
          schema_branch_description_en: 'Path to a digital asset',
          schema_branch_description_ru: 'Путь к файлу',
        },
      },
      {
        _: 'schema_branch',
        UUID: await digestMessage(await randomUUID()),
        schema_branch_name: 'actdate',
        schema_branch_trunk: 'datum',
        schema_branch_task: 'date',
        schema_branch_dir: 'date',
        schema_branch_description: {
          _: 'schema_branch_description',
          UUID: await digestMessage(await randomUUID()),
          schema_branch_description_en: 'Date of the event',
          schema_branch_description_ru: 'Дата события',
        },
      },
      {
        _: 'schema_branch',
        UUID: await digestMessage(await randomUUID()),
        schema_branch_name: 'datum',
        schema_branch_type: 'string',
        schema_branch_task: 'text',
        schema_branch_description: {
          _: 'schema_branch_description',
          UUID: await digestMessage(await randomUUID()),
          schema_branch_description_en: 'Description of the event',
          schema_branch_description_ru: 'Описание события',
        },
      },
      {
        _: 'schema_branch',
        UUID: await digestMessage(await randomUUID()),
        schema_branch_name: 'saydate',
        schema_branch_trunk: 'datum',
        schema_branch_task: 'date',
        schema_branch_dir: 'date',
        schema_branch_description: {
          _: 'schema_branch_description',
          UUID: await digestMessage(await randomUUID()),
          schema_branch_description_en: 'Date of entry',
          schema_branch_description_ru: 'Дата записи',
        },
      },
      {
        _: 'schema_branch',
        UUID: await digestMessage(await randomUUID()),
        schema_branch_name: 'filehash',
        schema_branch_trunk: 'file',
        schema_branch_type: 'hash',
        schema_branch_task: 'filehash',
        schema_branch_description: {
          _: 'schema_branch_description',
          UUID: await digestMessage(await randomUUID()),
          schema_branch_description_en: 'Hashsum of the file',
          schema_branch_description_ru: 'Хэш файла',
        },
      },
      {
        _: 'schema_branch',
        UUID: await digestMessage(await randomUUID()),
        schema_branch_name: 'category',
        schema_branch_trunk: 'datum',
        schema_branch_type: 'string',
        schema_branch_description: {
          _: 'schema_branch_description',
          UUID: await digestMessage(await randomUUID()),
          schema_branch_description_en: 'Category',
          schema_branch_description_ru: 'Категория',
        },
      },
      {
        _: 'schema_branch',
        UUID: await digestMessage(await randomUUID()),
        schema_branch_name: 'privacy',
        schema_branch_trunk: 'datum',
        schema_branch_type: 'string',
        schema_branch_description: {
          _: 'schema_branch_description',
          UUID: await digestMessage(await randomUUID()),
          schema_branch_description_en: 'Privacy',
          schema_branch_description_ru: 'Публичность',
        },
      },
      {
        _: 'schema_branch',
        UUID: await digestMessage(await randomUUID()),
        schema_branch_name: 'actname',
        schema_branch_trunk: 'datum',
        schema_branch_dir: 'name',
        schema_branch_description: {
          _: 'schema_branch_description',
          UUID: await digestMessage(await randomUUID()),
          schema_branch_description_en: 'Name of the person in the event',
          schema_branch_description_ru: 'Имя человека участвовавшего в событии',
        },
      },
      {
        _: 'schema_branch',
        UUID: await digestMessage(await randomUUID()),
        schema_branch_name: 'sayname',
        schema_branch_trunk: 'datum',
        schema_branch_dir: 'name',
        schema_branch_description: {
          _: 'schema_branch_description',
          UUID: await digestMessage(await randomUUID()),
          schema_branch_description_en: 'Name of the person who made the entry',
          schema_branch_description_ru: 'Имя автора записи',
        },
      },
    ],
  };
}

export const defaultSchema = {
  datum: {
    task: 'text',
    type: 'string',
    description: {
      en: 'Description of the event',
      ru: 'Описание события',
    },
  },
  hostdate: {
    trunk: 'datum',
    dir: 'date',
    task: 'date',
    description: {
      en: 'Date of the event',
      ru: 'Дата события',
    },
  },
  hostname: {
    trunk: 'datum',
    dir: 'name',
    description: {
      en: 'Name of the person in the event',
      ru: 'Имя человека участвовавшего в событии',
    },
  },
  guestdate: {
    trunk: 'datum',
    dir: 'date',
    task: 'date',
    description: {
      en: 'Date of entry',
      ru: 'Дата записи',
    },
  },
  guestname: {
    trunk: 'datum',
    dir: 'name',
    description: {
      en: 'Name of the person who made the entry',
      ru: 'Имя автора записи',
    },
  },
  category: {
    trunk: 'datum',
    description: {
      en: 'Category',
      ru: 'Категория',
    },
  },
  privacy: {
    trunk: 'datum',
    description: {
      en: 'Privacy',
      ru: 'Публичность',
    },
  },
  files: {
    trunk: 'datum',
    type: 'array',
    description: {
      en: 'Digital assets',
      ru: 'Файлы',
    },
  },
  file: {
    trunk: 'files',
    type: 'object',
    task: 'file',
    description: {
      en: 'Digital asset',
      ru: 'Файл',
    },
  },
  filename: {
    trunk: 'file',
    type: 'string',
    task: 'filename',
    description: {
      en: 'Path to a digital asset',
      ru: 'Путь к файлу',
    },
  },
  filehash: {
    trunk: 'file',
    type: 'hash',
    task: 'filehash',
    description: {
      en: 'Hash of a digital asset',
      ru: 'Хеш файла',
    },
  },
};

const schemaSchema = {
  schema: {
    trunk: 'reponame',
    type: 'array',
    description: {
      en: 'Schema of the repo',
      ru: 'Структура проекта',
    },
  },
  schema_branch: {
    trunk: 'schema',
    type: 'object',
    description: {
      en: 'Schema branch',
      ru: 'Ветка схемы',
    },
  },
  schema_branch_name: {
    trunk: 'schema_branch',
    type: 'string',
    description: {
      en: 'Branch name',
      ru: 'Название ветки',
    },
  },
  schema_branch_trunk: {
    trunk: 'schema_branch',
    type: 'string',
    description: {
      en: 'Branch trunk',
      ru: 'Ствол ветки',
    },
  },
  schema_branch_type: {
    trunk: 'schema_branch',
    type: 'string',
    description: {
      en: 'Branch type',
      ru: 'Тип ветки',
    },
  },
  schema_branch_task: {
    trunk: 'schema_branch',
    type: 'string',
    description: {
      en: 'Branch task',
      ru: 'Предназначение ветки',
    },
  },
  schema_branch_dir: {
    trunk: 'schema_branch',
    type: 'string',
    description: {
      en: 'Branch dir',
      ru: 'Директория ветки',
    },
  },
  schema_branch_description: {
    trunk: 'schema_branch',
    type: 'object',
    description: {
      en: 'Branch description',
      ru: 'Описание ветки',
    },
  },
  schema_branch_description_en: {
    trunk: 'schema_branch_description',
    type: 'string',
    description: {
      en: 'Branch description EN',
      ru: 'Описание ветки на английском',
    },
  },
  schema_branch_description_ru: {
    trunk: 'schema_branch_description',
    type: 'string',
    description: {
      en: 'Branch description RU',
      ru: 'Описание ветки на русском',
    },
  },
};

export const schemaRoot = {
  reponame: {
    type: 'string',
    description: {
      en: 'Name of the repo',
      ru: 'Название проекта',
    },
  },
  category: {
    type: 'string',
    description: {
      en: 'Category of the repo',
      ru: 'Категория проекта',
    },
  },
  ...schemaSchema,
  tags: {
    trunk: 'reponame',
    type: 'array',
  },
  ...schemaSync,
  ...schemaRemote,
  ...schemaRSS,
  ...schemaLocal,
};
