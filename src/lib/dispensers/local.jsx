import React from 'react';

export const schemaLocal = {
  local_tag: {
    trunk: 'tags',
    type: 'object',
    description: {
      en: 'Local archive tag',
      ru: 'Тег локального архива',
    },
  },
  local_path: {
    trunk: 'local_tag',
    type: 'string',
    task: 'directory',
    description: {
      en: 'Path to asset archive',
      ru: 'Путь к локальному архиву',
    },
  },
};

export function Local({ branchEntry }) {
  // TODO: add path picker
  return (<p>{branchEntry.local_path}</p>);
}
