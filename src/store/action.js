import { updateRecord, selectStream } from "@/store/impure.js";
import { createRoot, deleteRecord } from "@/store/record.js";
import {
  changeSearchParams,
  makeURL,
  pickDefaultBase,
  pickDefaultSortBy,
} from "@/store/pure.js";
import { find, clone } from "@/store/open.js";

export async function saveRecord(
  repouuid,
  base,
  records,
  recordOld,
  recordNew,
) {
  // if no root here try to create
  await createRoot();

  await updateRecord(repouuid, base, recordNew);

  const recordsNew = records
    .filter((r) => r[base] !== recordOld[base])
    .concat([recordNew]);

  return recordsNew;
}

export async function wipeRecord(repo, base, records, record) {
  await deleteRecord(repo, record);

  const recordsNew = records.filter((r) => r[base] !== record[base]);

  return recordsNew;
}

export async function changeRepo(pathname, search) {
  const uuid = pathname === "/" ? "root" : pathname.replace("/", "");

  const searchParams = new URLSearchParams(search);

  const remote = searchParams.get("~");

  const token = searchParams.get("-") ?? "";

  const { repo, schema } = searchParams.has("~")
    ? await clone(remote, token)
    : await find(uuid, undefined);

  if (!searchParams.has("_")) {
    searchParams.set("_", pickDefaultBase(schema));
  }

  if (!searchParams.has(".sortBy")) {
    searchParams.set(
      ".sortBy",
      pickDefaultSortBy(schema, searchParams.get("_")),
    );
  }

  return {
    repo,
    schema,
    searchParams,
  };
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

  window.history.replaceState(null, null, url);

  if (field.startsWith("."))
    return {
      searchParams: searchParamsNew,
      abortPreviousStream: () => {},
      startStream: () => {},
    };

  const { abortPreviousStream, startStream } = await selectStream(
    schema,
    repo,
    appendRecord,
    searchParamsNew,
  );

  return { searchParams: searchParamsNew, abortPreviousStream, startStream };
}
