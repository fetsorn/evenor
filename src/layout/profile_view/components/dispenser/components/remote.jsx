import React from 'react';
import { API } from '../../../../../api/index.js';

export const schemaRemote = {
  remote_tag: {
    trunk: 'tags',
    type: 'object',
    description: {
      en: 'Remote git tag',
      ru: 'Тег удаленного git репозитория',
    },
  },
  remote_name: {
    trunk: 'remote_tag',
    type: 'string',
    description: {
      en: 'Name of git remote',
      ru: 'Название remote .git',
    },
  },
  remote_url: {
    trunk: 'remote_tag',
    type: 'string',
    description: {
      en: 'Name of database to sync',
      ru: 'Название базы данных для синхронизации',
    },
  },
  remote_token: {
    trunk: 'remote_tag',
    type: 'string',
    description: {
      en: 'Authentication token',
      ru: 'Токен для синхронизации',
    },
  },
};

export function Remote({ baseEntry, branchEntry }) {
  const api = new API(baseEntry.UUID);

  async function onPullRepo() {
    await api.commit();

    await api.pull(branchEntry.remote_name);
  }

  async function onPushRepo() {
    await api.commit();

    await api.push(branchEntry.remote_name);
  }

  async function onRemoteSync() {
    await api.commit();

    await api.addRemote(branchEntry.remote_name, branchEntry.remote_url, branchEntry.remote_token);

    await api.pull(branchEntry.remote_name);

    await api.push(branchEntry.remote_name);
  }

  return (
    <div>
      <p>{branchEntry.remote_url}</p>
      <br />
      <button type="button" onClick={onPullRepo}>⬇️</button>
      <button type="button" onClick={onPushRepo}>⬆️</button>
      <button type="button" onClick={onRemoteSync}>🔄️</button>
    </div>
  );
}
