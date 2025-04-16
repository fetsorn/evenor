import history from "history/hash";
import api from "../api/index.js";
import {
  createRoot,
  saveRepoRecord,
  loadRepoRecord,
  newUUID,
  readSchema,
  findRecord,
  repoFromURL,
} from "./impure.js";
import { changeSearchParams, makeURL, searchParamsFromURL } from "./pure.js";
import schemaRoot from "./default_root_schema.json";
import defaultRepoRecord from "./default_repo_record.json";

export async function saveRecord(repo, base, records, recordOld, recordNew) {
  // if no root here try to create
  await createRoot();

  const isHomeScreen = repo === "root";

  const isRepoBranch = base === "repo";

  const canSaveRepo = isHomeScreen && isRepoBranch;

  // won't save root/branch-trunk.csv to disk as it's read from repo/_-_.csv
  if (canSaveRepo) {
    const branches = recordNew["branch"].map(
      ({ trunk, ...branchWithoutTrunk }) => branchWithoutTrunk,
    );

    const recordPruned = { ...recordNew, branch: branches };

    await api.updateRecord(repo, recordPruned);
  } else {
    await api.updateRecord(repo, recordNew);
  }

  await api.commit(repo);

  if (canSaveRepo) {
    await saveRepoRecord(recordNew);
  }

  const recordsNew = records
    .filter((r) => r[base] !== recordOld[base])
    .concat([recordNew]);

  return recordsNew;
}

export async function editRecord(repo, base, recordNew) {
  if (recordNew === undefined) {
    return undefined;
  }

  const isHomeScreen = repo === "root";

  const isRepoBranch = base === "repo";

  const isRepoRecord = isHomeScreen && isRepoBranch;

  const repoPartial = isRepoRecord ? defaultRepoRecord : {};

  const record = recordNew ?? {
    _: base,
    [base]: await newUUID(),
    ...repoPartial,
  };

  return record;
}

export async function wipeRecord(repo, base, records, record) {
  await api.deleteRecord(repo, record);

  await api.commit(repo);

  const recordsNew = records.filter((r) => r[base] !== record[base]);

  return recordsNew;
}

export async function changeRepo(uuid, baseNew) {
  if (uuid === "root") {
    return {
      repo: { _: "repo", repo: uuid },
      schema: schemaRoot,
      searchParams: new URLSearchParams("_=repo&.sortBy=reponame"),
    };
  } else {
    const [repo] = await api.select("root", { _: "repo", repo: uuid });

    const schema = await readSchema(uuid);

    // TODO pick default base from a root branch
    const base = baseNew;

    // TODO pick default sortBy from task === "date"
    const sortBy = base;

    return {
      repo,
      schema,
      searchParams: new URLSearchParams(`_=${base}&.sortBy=${sortBy}`),
    };
  }
}

export async function search(
  schema,
  searchParams,
  repo,
  reponame,
  field,
  value,
  appendRecord,
) {
  // update searchParams
  const searchParamsNew = changeSearchParams(searchParams, field, value);

  const url = makeURL(searchParamsNew, value, repo, reponame);

  window.history.replaceState(null, null, urlNew);

  if (field.startsWith("."))
    return {
      searchParams: searchParamsNew,
      abortPreviousStream: () => {},
      startStream: () => {},
    };

  const { abortPreviousStream, startStream } = findRecord(
    schema,
    repo,
    appendRecord,
    searchParamsNew,
  );

  return { searchParams: searchParamsNew, abortPreviousStream, startStream };
}

export async function launch() {
  const { schema, repo } = await repoFromURL(
    history.location.search,
    history.location.pathname,
  );

  // get searchParams from url
  const searchParams = searchParamsFromURL(history.location.search);

  return { schema, repo, searchParams };
}
