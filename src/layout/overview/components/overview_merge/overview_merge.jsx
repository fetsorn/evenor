import api from "@/api/index.js";

export function OverviewMerge(props) {
  async function onMerge() {
    // find UUID of repo to sync from
    const searchParams = new URLSearchParams();

    searchParams.set("_", "reponame");

    searchParams.set("reponame", props.branchRecord.sync_tag);

    const query = searchParamsToQuery(schema, searchParams);

    const [{ repo: subsetUUID }] = await api.select("root", query);

    const subsetSearchParams = new URLSearchParams(
      props.branchRecord.sync_tag_search,
    );

    const subsetQuery = searchParamsToQuery(schema, subsetSearchParams);

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
