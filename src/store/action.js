import history from "history/hash";
import { updateRecord, createRecord, selectStream } from "@/store/impure.js";
import { createRoot } from "@/store/record.js";
import { changeSearchParams, makeURL } from "@/store/pure.js";
import { find, clone } from "@/store/open.js";
import schemaRoot from "@/store/default_root_schema.json";

export async function saveRecord(repo, base, records, recordOld, recordNew) {
  // if no root here try to create
  await createRoot();

  await updateRecord(repo, base, recordNew);

  const recordsNew = records
    .filter((r) => r[base] !== recordOld[base])
    .concat([recordNew]);

  return recordsNew;
}

export async function editRecord(repo, base, recordNew) {
  // undefined -> delete record
  if (recordNew === undefined) {
    return undefined;
  }

  // {} -> create record
  const isNew = !Object.hasOwn(recordNew, "_");

  // { _: base } -> set record
  const record = isNew ? await createRecord(repo, base) : recordNew;

  return record;
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
    : await find(uuid);

  if (!searchParams.has("_")) {
    // TODO pick default base from a root branch of schema
    searchParams.set("_", Object.keys(schema)[0]);
  }

  if (!searchParams.has(".sortBy")) {
    // TODO pick default sortBy from task === "date" of schema
    searchParams.set(".sortBy", searchParams.get("_"));
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

  window.history.replaceState(null, null, urlNew);

  if (field.startsWith("."))
    return {
      searchParams: searchParamsNew,
      abortPreviousStream: () => {},
      startStream: () => {},
    };

  const { abortPreviousStream, startStream } = selectStream(
    schema,
    repo,
    appendRecord,
    searchParamsNew,
  );

  return { searchParams: searchParamsNew, abortPreviousStream, startStream };
}
