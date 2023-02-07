export const manifestOld = `{
    "datum": {
        "type": "text",
        "label": "DATUM",
        "description": {
           "en": "Description of the event",
           "ru": "Описание события"
        }
    },
    "hostdate": {
        "parent": "datum",
        "dir": "date",
        "type": "date",
        "label": "HOST_DATE",
        "description": {
           "en": "Date of the event",
           "ru": "Дата события"
        }
    },
    "hostname": {
        "parent": "datum",
        "dir": "name",
        "label": "HOST_NAME",
        "description": {
           "en": "Name of the person in the event",
           "ru": "Имя человека участвовавшего в событии"
        }
    },
    "guestdate": {
        "parent": "datum",
        "dir": "date",
        "type": "date",
        "label": "GUEST_DATE",
        "description": {
           "en": "Date of entry",
           "ru": "Дата записи"
        }
    },
    "guestname": {
        "parent": "datum",
        "dir": "name",
        "label": "GUEST_NAME",
        "description": {
           "en": "Name of the person who made the entry",
           "ru": "Имя автора записи"
        }
    },
    "tag": {
        "parent": "datum",
        "label": "TAG",
        "description": {
           "en": "Tag",
           "ru": "Тег"
        }
    },
    "filepath": {
        "parent": "datum",
        "label": "FILE_PATH",
        "type": "path",
        "description": {
           "en": "Path to a digital asset",
           "ru": "Путь к файлу"
        }
    }
}`;

export const manifest = `{
  "datum": {
    "type": "text",
    "label": "DATUM",
    "description": {
      "en": "Description of the event",
      "ru": "Описание события"
    }
  },
  "hostdate": {
    "trunk": "datum",
    "dir": "date",
    "type": "date",
    "label": "HOST_DATE",
    "description": {
      "en": "Date of the event",
      "ru": "Дата события"
    }
  },
  "hostname": {
    "trunk": "datum",
    "dir": "name",
    "label": "HOST_NAME",
    "description": {
      "en": "Name of the person in the event",
      "ru": "Имя человека участвовавшего в событии"
    }
  },
  "guestdate": {
    "trunk": "datum",
    "dir": "date",
    "type": "date",
    "label": "GUEST_DATE",
    "description": {
      "en": "Date of entry",
      "ru": "Дата записи"
    }
  },
  "guestname": {
    "trunk": "datum",
    "dir": "name",
    "label": "GUEST_NAME",
    "description": {
      "en": "Name of the person who made the entry",
      "ru": "Имя автора записи"
    }
  },
  "tag": {
    "trunk": "datum",
    "label": "TAG",
    "description": {
      "en": "Tag",
      "ru": "Тег"
    }
  },
  "filepath": {
    "trunk": "datum",
    "label": "FILE_PATH",
    "type": "path",
    "description": {
      "en": "Path to a digital asset",
      "ru": "Путь к файлу"
    }
  },
  "export_tags": {
    "trunk": "datum",
    "type": "array",
    "label": "TAGS"
  },
  "export1_tag": {
    "type": "object",
    "trunk": "export_tags",
    "label": "EXPORT1_TAG"
  },
  "export1_channel": {
    "trunk": "export1_tag",
    "type": "string",
    "label": "EXPORT1_CHANNEL"
  },
  "export1_key": {
    "trunk": "export1_tag",
    "type": "string",
    "label": "EXPORT1_KEY"
  },
  "export2_tag": {
    "type": "object",
    "trunk": "export_tags",
    "label": "EXPORT2_TAG"
  },
  "export2_username": {
    "trunk": "export2_tag",
    "type": "string",
    "label": "EXPORT2_USERNAME"
  },
  "export2_password": {
    "trunk": "export2_tag",
    "type": "string",
    "label": "EXPORT2_PASSWORD"
  }
}`;

export const manifestRoot = `{
  "reponame": {
    "type": "string",
    "label": "REPO_NAME",
    "description": {
      "en": "Name of the repo",
      "ru": "Название проекта"
    }
  },
  "schema": {
    "trunk": "reponame",
    "type": "string",
    "task": "schema",
    "label": "SCHEMA",
    "description": {
      "en": "Schema of the repo",
      "ru": "Структура проекта"
    }
  },
  "tags": {
    "trunk": "reponame",
    "type": "array",
    "label": "TAGS"
  },
  "local_tag": {
    "type": "object",
    "trunk": "tags",
    "label": "LOCAL_TAG",
    "description": {
      "en": "Local database tag",
      "ru": "Тег локальной базы данных"
    }
  },
  "sync_tag": {
    "type": "object",
    "trunk": "tags",
    "label": "SYNC_TAG",
    "description": {
      "en": "Synchronization tag",
      "ru": "Тег синхронизации баз данных"
    }
  },
  "sync_tag_search": {
    "trunk": "sync_tag",
    "type": "string",
    "label": "SYNC_TAG_SEARCH",
    "description": {
      "en": "Search query",
      "ru": "Поисковый запрос"
    }
  },
  "sync_tag_target": {
    "trunk": "sync_tag",
    "type": "string",
    "label": "SYNC_TAG_TARGET",
    "description": {
      "en": "Name of database to sync",
      "ru": "Название базы данных для синхронизации"
    }
  }
}`;
