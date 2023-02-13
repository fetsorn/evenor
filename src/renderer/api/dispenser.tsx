import React, { useState } from "react";
import { updateRepo, deleteRepo } from "./dispenser_repo";
import { checkRepo, syncRepo } from "./dispenser_sync";
import { useStore } from "@/store";

interface IDispenserProps {
  baseEntry: any;
  branchEntry: any;
}

export function Dispenser({baseEntry, branchEntry}: IDispenserProps) {

  const setRepoRoute = useStore((state) => state.setRepoRoute)

  const [entries, setEntries] = useState<any>([]);

  async function onCheckRepo() {
    const { sourceEntries, targetEntries } = await checkRepo(`repos/${baseEntry.REPO_NAME}`, `repos/${branchEntry.SYNC_TAG_TARGET}`, branchEntry.SYNC_TAG_SEARCH)

    // TODO: resolve diff between sourceEntries and targetEntries
    const entriesDiff = sourceEntries.concat(targetEntries)

    setEntries(entriesDiff)
  }

  async function onSyncRepo() {
    await syncRepo(`repos/${baseEntry.REPO_NAME}`, `repos/${branchEntry.SYNC_TAG_TARGET}`, entries)
  }

  switch (branchEntry['|']) {
  case "local_tag":
    return (
      <div>
        <a onClick={() => setRepoRoute(`repos/${baseEntry.REPO_NAME}`)}>{baseEntry.REPO_NAME}</a>
        <br/>
        <a onClick={() => updateRepo(baseEntry)}>🔄</a>
      </div>
    )

  case "sync_tag":
    return (
      <div>
        <a>{branchEntry.SYNC_TAG_SEARCH}</a>
        <br/>
        <a>{branchEntry.SYNC_TAG_TARGET}</a>
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
