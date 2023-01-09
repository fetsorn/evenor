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

export const manifestRoot = `{
    "reponame": {
        "type": "text",
        "label": "REPO_NAME",
        "description": {
           "en": "Name of the repo",
           "ru": "Название проекта"
        }
    },
    "schema": {
        "type": "schema",
        "label": "SCHEMA",
        "description": {
           "en": "Schema of the repo",
           "ru": "Структура проекта"
        }
    }
}`;
