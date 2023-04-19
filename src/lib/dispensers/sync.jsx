import React from 'react';
import { API } from '../api/index.js';

export const schemaSync = {
  sync_tag: {
    trunk: 'tags',
    type: 'object',
    description: {
      en: 'Synchronization tag',
      ru: 'Тег синхронизации баз данных',
    },
  },
  sync_tag_search: {
    trunk: 'sync_tag',
    type: 'string',
    description: {
      en: 'Search query',
      ru: 'Поисковый запрос',
    },
  },
  sync_tag_target: {
    trunk: 'sync_tag',
    type: 'string',
    description: {
      en: 'Name of database to sync',
      ru: 'Название базы данных для синхронизации',
    },
  },
};

export function Sync({ baseEntry, branchEntry }) {
  async function onSyncRepo() {
    // find UUID of repo to sync from
    const searchParams = new URLSearchParams();

    searchParams.set('_', 'reponame');

    searchParams.set('reponame', branchEntry.sync_tag_target);

    const rootAPI = new API('root');

    const [{ UUID: subsetUUID }] = await rootAPI.select(searchParams);

    const subsetAPI = new API(subsetUUID);

    // find entries to sync from subset
    const entries = await subsetAPI.select(
      new URLSearchParams(branchEntry.sync_tag_search),
    );

    const supersetAPI = new API(baseEntry.UUID);

    // sync entries to superset
    for (const entry of entries) {
      await supersetAPI.updateEntry(entry);
    }

    await supersetAPI.commit();
  }

  return (
    <div>
      <p>{branchEntry.sync_tag_target}</p>
      <br />
      <p>{branchEntry.sync_tag_search}</p>
      <br />
      <button type="button" onClick={onSyncRepo}>🔄</button>
    </div>
  );
}
