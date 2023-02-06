import React, { useState } from "react";
import { updateRepo, deleteRepo } from "./dispenser_repo";
import { checkRepo, syncRepo } from "./dispenser_sync";
import { useStore } from "@/store";

interface IDispenserProps {
  repoRoute: string;
  schema: any;
  entry: any;
  field: string;
  value: any;
}

export function Dispenser({repoRoute, schema, entry, field, value}: IDispenserProps) {

  const setRepoRoute = useStore((state) => state.setRepoRoute)

  const [entries, setEntries] = useState<any>([]);

  async function onCheckRepo() {
    const { sourceEntries, targetEntries } = await checkRepo(`repos/${entry.REPO_NAME}`, `repos/${value.SYNC_TAG_TARGET}`, value.SYNC_TAG_SEARCH)

    // TODO: resolve diff between sourceEntries and targetEntries
    const entriesDiff = sourceEntries.concat(targetEntries)

    setEntries(entriesDiff)
  }

  async function onSyncRepo() {
    await syncRepo(`repos/${entry.REPO_NAME}`, `repos/${value.SYNC_TAG_TARGET}`, entries)
  }

  switch (field) {
  case "local_tag":
    return (
      <div>
        <a onClick={() => setRepoRoute(`repos/${entry.REPO_NAME}`)}>{entry.REPO_NAME}</a>
        <br/>
        <a onClick={() => updateRepo(entry)}>🔄</a>
      </div>
    )

  case "sync_tag":
    return (
      <div>
        <a>{value.SYNC_TAG_SEARCH}</a>
        <br/>
        <a>{value.SYNC_TAG_TARGET}</a>
        <br/>
        <a onClick={onCheckRepo}>🔄</a>
        <br/>
        <a>{JSON.stringify(entries)}</a>
        <br/>
        <a onClick={onSyncRepo}>==V==</a>
      </div>
    )

  default:
    return (
      <></>
    )
  }
}
