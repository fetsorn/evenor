import React from "react";
import { API } from "@/api/index.js";

export function ViewSync({ schema, baseRecord, branchRecord }) {
  async function onSyncRepo() {
    // find UUID of repo to sync from
    const searchParams = new URLSearchParams();

    searchParams.set("_", "reponame");

    searchParams.set("reponame", branchRecord.sync_tag);

    const rootAPI = new API("root");

    const query = searchParamsToQuery(schema, searchParams);

    const [{ repo: subsetUUID }] = await rootAPI.select(query);

    const subsetAPI = new API(subsetUUID);

    const subsetSearchParams = new URLSearchParams(
      branchRecord.sync_tag_search,
    );

    const subsetQuery = searchParamsToQuery(schema, subsetSearchParams);

    // find entries to sync from subset
    const entries = await subsetAPI.select(subsetQuery);

    const supersetAPI = new API(baseRecord.repo);

    // sync entries to superset
    for (const record of entries) {
      await supersetAPI.updateRecord(record);
    }

    await supersetAPI.commit();
  }

  return (
    <span>
      <span>Sync</span>
      <span>{branchRecord.sync_tag}</span>
      <br />
      <span>{branchRecord.sync_tag_search}</span>
      <button type="button" onClick={onSyncRepo}>
        🔄
      </button>
    </span>
  );
}
