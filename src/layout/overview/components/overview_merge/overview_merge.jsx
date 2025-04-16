import api from "@/api/index.js";
import { searchParamsToQuery } from "@/store/index.js";

export function OverviewMerge(props) {
  async function onMerge() {
    const query = { _: "reponame", reponame: props.branchRecord.sync_tag };

    const [{ repo: subsetUUID }] = await api.select("root", query);

    const subsetQuery = searchParamsToQuery(
      schema,
      new URLSearchParams(props.branchRecord.sync_tag_search),
    );

    // find entries to sync from subset
    const entries = await api.select(subsetUUID, subsetQuery);

    // sync entries to superset
    for (const record of entries) {
      await api.updateRecord(props.baseRecord.repo, record);
    }

    await api.commit(props.baseRecord.repo);
  }

  return (
    <span>
      <a onClick={onMerge}>merge</a>
      <span>{props.branchRecord.sync_tag}</span>
      <span> </span>
      <span>{props.branchRecord.sync_tag_search}</span>
    </span>
  );
}
