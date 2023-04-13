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
  local_tag_target: {
    trunk: 'local_tag',
    type: 'string',
    description: {
      en: 'Path to asset archive',
      ru: 'Путь к локальному архиву',
    },
  },
};

export function Local({ branchEntry }) {
  return (<p>{branchEntry.local_tag_target}</p>)
}
