import React from "react";
import { API } from "@/api/index.js";

export function ViewRemote({ baseRecord, branchRecord }) {
  const api = new API(baseRecord.repo);

  async function onPullRepo() {
    await api.commit();

    await api.pull(branchRecord.remote_name);
  }

  async function onPushRepo() {
    await api.commit();

    await api.push(branchRecord.remote_name);
  }

  async function onRemoteSync() {
    await api.commit();

    await api.addRemote(
      branchRecord.remote_name,
      branchRecord.remote_url,
      branchRecord.remote_token,
    );

    await api.pull(branchRecord.remote_name);

    await api.push(branchRecord.remote_name);
  }

  return (
    <span>
      <span>Remote git</span>
      <span> </span>
      <span>{branchRecord.remote_tag}</span>
      <span> </span>
      <span>{branchRecord.remote_url}</span>
      <span> </span>
      <a onClick={onPullRepo}>pull</a>
      <span> </span>
      <a onClick={onPushRepo}>push</a>
    </span>
  );
}
