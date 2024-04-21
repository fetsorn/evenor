import React from "react";
import { API } from "@/api/index.js";

export function ViewRemote({ baseRecord, branchRecord }) {
  const api = new API(baseRecord.repo);

  async function onPullRepo() {
    await api.commit();

    await api.pull(branchRecord.remote_tag);
  }

  async function onPushRepo() {
    await api.commit();

    await api.push(branchRecord.remote_tag);
  }

  async function onRemoteSync() {
    await api.commit();

    await api.addRemote(
      branchRecord.remote_tag,
      branchRecord.remote_url,
      branchRecord.remote_token,
    );

    await api.pull(branchRecord.remote_tag);

    await api.push(branchRecord.remote_tag);
  }

  return (
    <div>
      <p>Remote git</p>
      <p>{branchRecord.remote_tag}</p>
      <p>{branchRecord.remote_url}</p>
      <br />
      <button type="button" onClick={onPullRepo}>
        ⬇️
      </button>
      <button type="button" onClick={onPushRepo}>
        ⬆️
      </button>
      <button type="button" onClick={onRemoteSync}>
        🔄️
      </button>
    </div>
  );
}
