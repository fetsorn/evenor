import { API } from "@/api/index.js";

export function OverviewMerge(props) {
  async function onMerge() {
    // find UUID of repo to sync from
    const searchParams = new URLSearchParams();

    searchParams.set("_", "reponame");

    searchParams.set("reponame", props.branchRecord.sync_tag);

    const rootAPI = new API("root");

    const query = searchParamsToQuery(schema, searchParams);

    const [{ repo: subsetUUID }] = await rootAPI.select(query);

    const subsetAPI = new API(subsetUUID);

    const subsetSearchParams = new URLSearchParams(
      props.branchRecord.sync_tag_search,
    );

    const subsetQuery = searchParamsToQuery(schema, subsetSearchParams);

    // find entries to sync from subset
    const entries = await subsetAPI.select(subsetQuery);

    const supersetAPI = new API(props.baseRecord.repo);

    // sync entries to superset
    for (const record of entries) {
      await supersetAPI.updateRecord(record);
    }

    await supersetAPI.commit();
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
