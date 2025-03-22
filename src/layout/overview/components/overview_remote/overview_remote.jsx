import { API } from "@/api/index.js";

export function OverviewRemote(props) {
  const [loading, setLoading] = createSignal(false);

  async function onPullRepo() {
    setLoading(true);

    const api = new API(props.baseRecord.repo);

    try {
      await api.commit();

      await api.pull(props.branchRecord.remote_name);

      setLoading(false);
    } catch (e) {
      console.log(e);

      setLoading(false);
    }
  }

  async function onPushRepo() {
    setLoading(true);

    const api = new API(props.baseRecord.repo);

    try {
      await api.commit();

      await api.push(props.branchRecord.remote_name);

      setLoading(false);
    } catch (e) {
      console.log(e);

      setLoading(false);
    }
  }

  return (
    <span>
      <span>Remote git</span>
      <span> </span>
      <span>{props.branchRecord.remote_tag}</span>
      <span> </span>
      <span>{props.branchRecord.remote_url}</span>
      <span> </span>
      <a onClick={onPullRepo}>pull</a>
      <span> </span>
      <a onClick={onPushRepo}>push</a>
      <span> </span>
      <Show when={loading()} fallback={<></>}>
        <span>loading...</span>
      </Show>
    </span>
  );
}
