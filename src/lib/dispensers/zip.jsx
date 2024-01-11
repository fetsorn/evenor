import React from 'react';
import { API } from '../../api/index.js';

export const schemaZip = {
  zip_tag: {
    trunk: 'tags',
    type: 'object',
    description: {
      en: 'Zip archive tag',
      ru: 'Тег zip архива',
    },
  },
};

export function Zip({ baseEntry }) {
  async function onZip() {
    const api = new API(baseEntry.UUID);

    await api.zip();
  }
  return (<button type="button" onClick={onZip}>⬇️</button>);
}
