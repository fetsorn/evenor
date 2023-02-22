import React, { useState } from "react";
import { API } from "../api";

export function Sync({baseEntry, branchEntry}) {
  const [entries, setEntries] = useState<any>([]);

  const sourceAPI = new API(`/repos/${baseEntry.reponame}`);

  const targetAPI = new API(`repos/${branchEntry.sync_tag_target}`);

  async function onCheckRepo() {
    const searchParams = new URLSearchParams(branchEntry.sync_tag_search);

    // get array of events by search from source
    const sourceEntries = await sourceAPI.select(searchParams);

    // get array of events by search from target
    const targetEntries = await targetAPI.select(searchParams);

    // TODO: resolve diff between sourceEntries and targetEntries
    const entriesDiff = sourceEntries.concat(targetEntries)

    setEntries(entriesDiff)
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
      <a>{branchEntry.sync_tag_search}</a>
      <br/>
      <a>{branchEntry.sync_tag_target}</a>
      <br/>
      <a onClick={onCheckRepo}>🔄</a>
      <br/>
      <a>{JSON.stringify(entries)}</a>
      <br/>
      <a onClick={onSyncRepo}>==V==</a>
    </div>
  )
}
