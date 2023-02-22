import React, { useState } from 'react';
import { API } from '../api/index.js';

export function Sync({ baseEntry, branchEntry }) {
  const [entries, setEntries] = useState([]);

  const sourceAPI = new API(baseEntry.UUID);

  // TODO detect UUID of target
  const target = branchEntry.sync_tag_target;

  const targetAPI = new API(target);

  async function onCheckRepo() {
    const searchParams = new URLSearchParams(branchEntry.sync_tag_search);

    // get array of events by search from source
    const sourceEntries = await sourceAPI.select(searchParams);

    // get array of events by search from target
    const targetEntries = await targetAPI.select(searchParams);

    // TODO: resolve diff between sourceEntries and targetEntries
    const entriesDiff = sourceEntries.concat(targetEntries);

    setEntries(entriesDiff);
  }

  async function onSyncRepo() {
    for (const entry of entries) {
      // write events to sourceDir
      await sourceAPI.updateEntry(entry);

      // write events to targetDir
      await targetAPI.updateEntry(entry);
    }
  }

  return (
    <div>
      <p>{branchEntry.sync_tag_search}</p>
      <br />
      <p>{branchEntry.sync_tag_target}</p>
      <br />
      <button type="button" onClick={onCheckRepo}>🔄</button>
      <br />
      <p>{JSON.stringify(entries)}</p>
      <br />
      <button type="button" onClick={onSyncRepo}>==V==</button>
    </div>
  );
}
