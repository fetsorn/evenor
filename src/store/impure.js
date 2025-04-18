import api from "../api/index.js";
import {
  extractSchemaRecords,
  enrichBranchRecords,
  recordsToSchema,
  schemaToBranchRecords,
  searchParamsToQuery,
} from "./pure.js";
import {
  newUUID,
  updateRepo,
  readSchema,
  createRoot,
  updateEntry,
  deleteRecord,
  saveRepoRecord,
  loadRepoRecord,
} from "./foo.js";
import schemaRoot from "./default_root_schema.json";
import defaultRepoRecord from "./default_repo_record.json";

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

export async function cloneAndOpen(searchParams) {
  // if uri specifies a remote
  // try to clone remote
  // where repo uuid is a digest of remote
  // and repo name is uri-encoded remote
  const remote = searchParams.get("~");

  const token = searchParams.get("-") ?? "";

  const repoUUIDRemote = await digestMessage(remote);

  try {
    // if no root here try to create
    await createRoot();

    // TODO rimraf the folder if it already exists

    await api.cloneView(repoUUIDRemote, remote, token);

    // TODO add new repo to root
    // TODO return a repo record

    const pathname = new URL(remote).pathname;

    // get repo name from remote
    const reponameClone = pathname.substring(pathname.lastIndexOf("/") + 1);

    const schemaClone = await readSchema(repoUUIDRemote);

    const [schemaRecordClone, ...metaRecordsClone] =
      schemaToBranchRecords(schemaClone);

    const branchRecordsClone = enrichBranchRecords(
      schemaRecordClone,
      metaRecordsClone,
    );

    const recordClone = {
      _: "repo",
      repo: repoUUIDRemote,
      reponame: reponameClone,
      branch: branchRecordsClone,
      remote_tag: {
        _: "remote_tag",
        remote_tag: "",
        remote_token: token,
        remote_url: remote,
      },
    };

    await updateRepo(recordClone);

    await saveRepoRecord(recordClone);

    return { schema: schemaClone, repo: repoClone };
  } catch (e) {
    // proceed to choose root repo uuid
    console.log(e);
  }
}

export async function findAndOpen(repoRoute) {
  // find uuid in root folder
  try {
    const [repo] = await api.select("root", { _: "repo", reponame: repoRoute });

    const { repo: repoUUID } = repo;

    const schema = await readSchema(repoUUID);

    return { schema, repo };
  } catch {
    // proceed to set repo uuid as root
  }
}

export async function repoFromURL(search, pathname) {
  const searchParams = new URLSearchParams(search);

  const repoRoute = pathname.replace("/", "");

  const root = { schema: schemaRoot, repo: { _: "repo", repo: "root" } };

  if (searchParams.has("~")) {
    // clone from remote and open
    try {
      return cloneAndOpen(searchParams);
    } catch (e) {
      console.log(e);
      // TODO set url to root

      return root;
    }
  }

  if (repoRoute !== "") {
    // open
    try {
      return findAndOpen(repoRoute);
    } catch (e) {
      console.log(e);
      // TODO set url to root

      return root;
    }
  }

  return root;
}
