import { API } from "../api";

export function Remote({baseEntry, branchEntry}) {
  const api = new API(`/repos/${baseEntry.reponame}`);

  async function onPullRepo() {
    await api.commit()

    await api.addRemote(branchEntry.remote_tag_target);

    await api.pull(branchEntry.remote_tag_token);
  }

  async function onPushRepo() {
    await api.commit()

    await api.addRemote(branchEntry.remote_tag_target);

    await api.push(branchEntry.remote_tag_token);
  }

  async function onRemoteSync() {
    await api.commit()

    await api.addRemote(branchEntry.remote_tag_target);

    await api.pull(branchEntry.remote_tag_token);

    await api.push(branchEntry.remote_tag_token);
  }


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
}
