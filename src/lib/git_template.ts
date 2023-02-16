export const manifest = `{
  "datum": {
    "task": "text",
    "type": "string",
    "description": {
      "en": "Description of the event",
      "ru": "Описание события"
    }
  },
  "hostdate": {
    "trunk": "datum",
    "dir": "date",
    "task": "date",
    "description": {
      "en": "Date of the event",
      "ru": "Дата события"
    }
  },
  "hostname": {
    "trunk": "datum",
    "dir": "name",
    "description": {
      "en": "Name of the person in the event",
      "ru": "Имя человека участвовавшего в событии"
    }
  },
  "guestdate": {
    "trunk": "datum",
    "dir": "date",
    "task": "date",
    "description": {
      "en": "Date of entry",
      "ru": "Дата записи"
    }
  },
  "guestname": {
    "trunk": "datum",
    "dir": "name",
    "description": {
      "en": "Name of the person who made the entry",
      "ru": "Имя автора записи"
    }
  },
  "tag": {
    "trunk": "datum",
    "description": {
      "en": "Tag",
      "ru": "Тег"
    }
  },
  "filepath": {
    "trunk": "datum",
    "type": "path",
    "description": {
      "en": "Path to a digital asset",
      "ru": "Путь к файлу"
    }
  }
}`;

export const manifestRoot = `{
  "reponame": {
    "type": "string",
    "description": {
      "en": "Name of the repo",
      "ru": "Название проекта"
    }
  },
  "schema": {
    "trunk": "reponame",
    "type": "array",
    "description": {
      "en": "Schema of the repo",
      "ru": "Структура проекта"
    }
  },
  "schema_branch": {
    "trunk": "schema",
    "type": "object",
    "description": {
      "en": "Schema branch",
      "ru": "Ветка схемы"
    }
  },
  "schema_branch_name": {
    "trunk": "schema_branch",
    "type": "string",
    "description": {
      "en": "Branch name",
      "ru": "Название ветки"
    }
  },
  "schema_branch_trunk": {
    "trunk": "schema_branch",
    "type": "string",
    "description": {
      "en": "Branch trunk",
      "ru": "Ствол ветки"
    }
  },
  "schema_branch_type": {
    "trunk": "schema_branch",
    "type": "string",
    "description": {
      "en": "Branch type",
      "ru": "Тип ветки"
    }
  },
  "schema_branch_task": {
    "trunk": "schema_branch",
    "type": "string",
    "description": {
      "en": "Branch task",
      "ru": "Предназначение ветки"
    }
  },
  "schema_branch_dir": {
    "trunk": "schema_branch",
    "type": "string",
    "description": {
      "en": "Branch dir",
      "ru": "Директория ветки"
    }
  },
  "schema_branch_description": {
    "trunk": "schema_branch",
    "type": "object",
    "description": {
      "en": "Branch description",
      "ru": "Описание ветки"
    }
  },
  "schema_branch_description_en": {
    "trunk": "schema_branch_description",
    "type": "string",
    "description": {
      "en": "Branch description EN",
      "ru": "Описание ветки на английском"
    }
  },
  "schema_branch_description_ru": {
    "trunk": "schema_branch_description",
    "type": "string",
    "description": {
      "en": "Branch description RU",
      "ru": "Описание ветки на русском"
    }
  },
  "tags": {
    "trunk": "reponame",
    "type": "array"
  },
  "local_tag": {
    "trunk": "tags",
    "type": "object",
    "description": {
      "en": "Local database tag",
      "ru": "Тег локальной базы данных"
    }
  },
  "sync_tag": {
    "trunk": "tags",
    "type": "object",
    "description": {
      "en": "Synchronization tag",
      "ru": "Тег синхронизации баз данных"
    }
  },
  "sync_tag_search": {
    "trunk": "sync_tag",
    "type": "string",
    "description": {
      "en": "Search query",
      "ru": "Поисковый запрос"
    }
  },
  "sync_tag_target": {
    "trunk": "sync_tag",
    "type": "string",
    "description": {
      "en": "Name of database to sync",
      "ru": "Название базы данных для синхронизации"
    }
  },
  "remote_tag": {
    "trunk": "tags",
    "type": "object",
    "description": {
      "en": "Remote git tag",
      "ru": "Тег удаленного git репозитория"
    }
  },
  "remote_tag_search": {
    "trunk": "remote_tag",
    "type": "string",
    "description": {
      "en": "Search query",
      "ru": "Поисковый запрос"
    }
  },
  "remote_tag_target": {
    "trunk": "remote_tag",
    "type": "string",
    "description": {
      "en": "Name of database to sync",
      "ru": "Название базы данных для синхронизации"
    }
  },
  "remote_tag_token": {
    "trunk": "remote_tag",
    "type": "string",
    "description": {
      "en": "Authentication token",
      "ru": "Токен для синхронизации"
    }
  },
  "rss_tag": {
    "trunk": "tags",
    "type": "object",
    "description": {
      "en": "Rss git tag",
      "ru": "Тег удаленного RSS git репозитория"
    }
  },
  "rss_tag_search": {
    "trunk": "rss_tag",
    "type": "string",
    "description": {
      "en": "Search query",
      "ru": "Поисковый запрос"
    }
  },
  "rss_tag_target": {
    "trunk": "rss_tag",
    "type": "string",
    "description": {
      "en": "Name of database to sync",
      "ru": "Название базы данных для синхронизации"
    }
  },
  "rss_tag_token": {
    "trunk": "rss_tag",
    "type": "string",
    "description": {
      "en": "Authentication token",
      "ru": "Токен для синхронизации"
    }
  },
  "rss_tag_title": {
    "trunk": "rss_tag",
    "type": "string",
    "description": {
      "en": "Title of RSS feed",
      "ru": "Название RSS ленты"
    }
  },
  "rss_tag_description": {
    "trunk": "rss_tag",
    "type": "string",
    "description": {
      "en": "Description of RSS feed",
      "ru": "Описание RSS ленты"
    }
  },
  "rss_tag_creator": {
    "trunk": "rss_tag",
    "type": "string",
    "description": {
      "en": "Creator of RSS feed",
      "ru": "Создатель RSS ленты"
    }
  },
  "rss_tag_item_title": {
    "trunk": "rss_tag",
    "type": "string",
    "description": {
      "en": "Branch for post title",
      "ru": "Ветка для названия поста"
    }
  },
  "rss_tag_item_description": {
    "trunk": "rss_tag",
    "type": "string",
    "description": {
      "en": "Branch for post description",
      "ru": "Ветка для описания поста"
    }
  },
  "rss_tag_item_pubdate": {
    "trunk": "rss_tag",
    "task": "date",
    "description": {
      "en": "Branch for post pubdate",
      "ru": "Ветка для даты публикации поста"
    }
  },
  "rss_tag_item_category": {
    "trunk": "rss_tag",
    "description": {
      "en": "Branch for post category",
      "ru": "Ветка для категории поста"
    }
  },
  "rss_tag_item_link": {
    "trunk": "rss_tag",
    "description": {
      "en": "Branch for post link",
      "ru": "Ветка для ссылки поста"
    }
  }
}`;
