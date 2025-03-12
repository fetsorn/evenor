import React, { useState } from "react";
import { API } from "@/api/index.js";

export function ViewRemote({ baseRecord, branchRecord }) {
  const api = new API(baseRecord.repo);

  const [isLoading, setLoading] = useState(false);

  async function onPullRepo() {
    setLoading(true);

    try {
      await api.commit();

      await api.pull(branchRecord.remote_name);

      setLoading(false);
    } catch (e) {
      console.log(e);

      setLoading(false);
    }
  }

  async function onPushRepo() {
    setLoading(true);

    try {
      await api.commit();

      await api.push(branchRecord.remote_name);

      setLoading(false);
    } catch (e) {
      console.log(e);

      setLoading(false);
    }
  }

  async function onRemoteSync() {
    await api.commit();

    await api.addRemote(
      branchRecord.remote_name,
      branchRecord.remote_url,
      branchRecord.remote_token,
    );

    await api.pull(branchRecord.remote_name);

    u;
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
      <span> </span>
      {isLoading ? <span>loading...</span> : <span />}
    </span>
  );
}
