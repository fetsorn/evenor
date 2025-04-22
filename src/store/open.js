import api from "@/api/index.js";
import { enrichBranchRecords, schemaToBranchRecords } from "@/store/pure.js";
import {
  readSchema,
  createRoot,
  updateRepo,
  saveRepoRecord,
} from "@/store/record.js";
import schemaRoot from "@/store/default_root_schema.json";

export async function find(reponame) {
  if (reponame === "root")
    return {
      schema: schemaRoot,
      repo: { _: "repo", repo: "root" },
    };

  // find uuid in root folder
  const [repo] = await api.select("root", { _: "repo", reponame: reponame });

  const { repo: repoUUID } = repo;

  const schema = await readSchema(repoUUID);

  return { schema, repo };
}

export async function clone(url, token) {
  // if no root here try to create
  await createRoot();

  // if uri specifies a remote
  // try to clone remote
  // where repo uuid is a digest of remote
  // and repo name is uri-encoded remote
  const encoded = new TextEncoder().encode(url);

  const repoUUIDRemote = crypto.subtle.digest("SHA-256", encoded);

  // TODO rimraf the folder if it already exists
  await api.clone(repoUUIDRemote, url, token);

  // TODO add new repo to root
  // TODO return a repo record

  const pathname = new URL(url).pathname;

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
      remote_tag: "origin",
      remote_token: token,
      remote_url: url,
    },
  };

  await updateRepo(recordClone);

  await saveRepoRecord(recordClone);

  return { schema: schemaClone, repo: recordClone };
}
