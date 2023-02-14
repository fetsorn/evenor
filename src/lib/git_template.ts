export const manifest = `{
  "datum": {
    "type": "text",
    "description": {
      "en": "Description of the event",
      "ru": "Описание события"
    }
  },
  "hostdate": {
    "trunk": "datum",
    "dir": "date",
    "type": "date",
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
    "type": "date",
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
    "type": "string",
    "task": "schema",
    "description": {
      "en": "Schema of the repo",
      "ru": "Структура проекта"
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
  }
}`;
