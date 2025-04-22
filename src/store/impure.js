import api from "@/api/index.js";
import {
  extractSchemaRecords,
  enrichBranchRecords,
  recordsToSchema,
  schemaToBranchRecords,
  searchParamsToQuery,
} from "@/store/pure.js";
import {
  newUUID,
  updateRepo,
  readSchema,
  createRoot,
  updateEntry,
  deleteRecord,
  saveRepoRecord,
  loadRepoRecord,
} from "@/store/record.js";
import { clone, find } from "@/store/open.js";
import schemaRoot from "@/store/default_root_schema.json";
import defaultRepoRecord from "@/store/default_repo_record.json";

export async function updateRecord(repo, base, recordNew) {
  const isHomeScreen = repo === "root";

  const isRepoBranch = base === "repo";

  const canSaveRepo = isHomeScreen && isRepoBranch;

  if (canSaveRepo) {
    await updateRepo(recordNew);

    await saveRepoRecord(recordNew);
  } else {
    await updateEntry(repo, recordNew);
  }
}

export async function createRecord(repo, base) {
  const isHomeScreen = repo === "root";

  const isRepoBranch = base === "repo";

  const isRepoRecord = isHomeScreen && isRepoBranch;

  const repoPartial = isRepoRecord ? defaultRepoRecord : {};

  const record = {
    _: base,
    [base]: await newUUID(),
    ...repoPartial,
  };

  return record;
}

export async function selectStream(schema, repo, appendRecord, searchParams) {
  // prepare a controller to stop the new stream
  let isAborted = false;

  const abortController = new AbortController();

  function abortPreviousStream() {
    isAborted = true;

    abortController.abort();
  }

  // remove all evenor-specific searchParams before passing to csvs
  const searchParamsWithoutCustom = new URLSearchParams(
    searchParams.entries().filter(([key]) => !key.startsWith(".")),
  );

  const query = searchParamsToQuery(schema, searchParamsWithoutCustom);

  // prepare a new stream
  const { strm: fromStrm, closeHandler } = await api.selectStream(repo, query);

  const isHomeScreen = repo === "root";

  // create a stream that appends to records
  const toStrm = new WritableStream({
    async write(chunk) {
      if (isAborted) {
        return;
      }

      // when selecting a repo, load git state and schema from folder into the record
      const record = isHomeScreen ? await loadRepoRecord(chunk) : chunk;

      appendRecord(record);
    },

    abort() {
      // stream interrupted
      // no need to await on the promise, closing api stream for cleanup
      closeHandler();
    },
  });

  async function startStream() {
    return fromStrm.pipeTo(toStrm, { signal: abortController.signal });
  }

  return { abortPreviousStream, startStream };
}
