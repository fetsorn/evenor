import React from "react";
import { API } from "@/api/index.js";

export function Sync({ baseRecord, branchRecord }) {
  async function onSyncRepo() {
    // find UUID of repo to sync from
    const searchParams = new URLSearchParams();

    searchParams.set("_", "reponame");

    searchParams.set("reponame", branchRecord.sync_tag_target);

    const rootAPI = new API("root");

    const [{ UUID: subsetUUID }] = await rootAPI.select(searchParams);

    const subsetAPI = new API(subsetUUID);

    // find entries to sync from subset
    const entries = await subsetAPI.select(
      new URLSearchParams(branchRecord.sync_tag_search),
    );

    const supersetAPI = new API(baseRecord.UUID);

    // sync entries to superset
    for (const record of entries) {
      await supersetAPI.updateRecord(record);
    }

    await supersetAPI.commit();
  }

  return (
    <div>
      <p>Sync</p>
      <p>{branchRecord.sync_tag_target}</p>
      <br />
      <p>{branchRecord.sync_tag_search}</p>
      <br />
      <button type="button" onClick={onSyncRepo}>
        🔄
      </button>
    </div>
  );
}
