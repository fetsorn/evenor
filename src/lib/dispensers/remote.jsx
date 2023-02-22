import React from 'react';
import { API } from '../api/index.js';

export function Remote({ baseEntry, branchEntry }) {
  const api = new API(baseEntry.UUID);

  async function onPullRepo() {
    await api.commit();

    await api.pull(branchEntry.remote_tag_target, branchEntry.remote_tag_token);
  }

  async function onPushRepo() {
    await api.commit();

    await api.push(branchEntry.remote_tag_target, branchEntry.remote_tag_token);
  }

  async function onRemoteSync() {
    await api.commit();

    await api.addRemote(branchEntry.remote_tag_target);

    await api.pull(branchEntry.remote_tag_target, branchEntry.remote_tag_token);

    await api.push(branchEntry.remote_tag_target, branchEntry.remote_tag_token);
  }

  return (
    <div>
      <p>{branchEntry.remote_tag_search}</p>
      <br />
      <p>{branchEntry.remote_tag_target}</p>
      <br />
      <button type="button" onClick={onPullRepo}>⬇️</button>
      <button type="button" onClick={onPushRepo}>⬆️</button>
      <button type="button" onClick={onRemoteSync}>🔄️</button>
    </div>
  );
}
