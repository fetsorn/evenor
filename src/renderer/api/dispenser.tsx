import React, { useState } from "react";
import { updateRepo, deleteRepo, gitcommit, push, pull, addRemote } from "./dispenser_repo";
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
    const { sourceEntries, targetEntries } = await checkRepo(
      `repos/${baseEntry.reponame}`,
      `repos/${branchEntry.sync_tag_target}`,
      branchEntry.sync_tag_search
    )

    // TODO: resolve diff between sourceEntries and targetEntries
    const entriesDiff = sourceEntries.concat(targetEntries)

    setEntries(entriesDiff)
  }

  async function onSyncRepo() {
    await syncRepo(
      `repos/${baseEntry.reponame}`,
      `repos/${branchEntry.sync_tag_target}`,
      entries
    )
  }

  async function onPullRepo() {
    await gitcommit(`/repos/${baseEntry.reponame}`)

    await addRemote(`/repos/${baseEntry.reponame}`, branchEntry.remote_tag_target);

    await pull(`/repos/${baseEntry.reponame}`, branchEntry.remote_tag_token);
  }

  async function onPushRepo() {
    await gitcommit(`/repos/${baseEntry.reponame}`)

    await addRemote(`/repos/${baseEntry.reponame}`, branchEntry.remote_tag_target);

    await push(`/repos/${baseEntry.reponame}`, branchEntry.remote_tag_token);
  }

  async function onRemoteSync() {
    await gitcommit(`/repos/${baseEntry.reponame}`)

    await addRemote(`/repos/${baseEntry.reponame}`, branchEntry.remote_tag_target);

    await pull(`/repos/${baseEntry.reponame}`, branchEntry.remote_tag_token);

    await push(`/repos/${baseEntry.reponame}`, branchEntry.remote_tag_token);
  }

  switch (branchEntry['|']) {
  case "local_tag":
    return (
      <div>
        <a onClick={() => setRepoRoute(`repos/${baseEntry.reponame}`)}>{baseEntry.reponame}</a>
        <br/>
        <a onClick={() => updateRepo(baseEntry.UUID, baseEntry.schema, baseEntry.reponame)}>🔄</a>
      </div>
    )

  case "sync_tag":
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

  case "remote_tag":
    return (
      <div>
        <a>{branchEntry.remote_tag_search}</a>
        <br/>
        <a>{branchEntry.remote_tag_target}</a>
        <br/>
        <a onClick={onPullRepo}>⬇️</a>
        <a onClick={onPushRepo}>⬆️</a>
        <a onClick={onRemoteSync}>🔄️</a>
      </div>
    )

  default:
    return (
      <></>
    )
  }
}
