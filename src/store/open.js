import api from "@/api/index.js";
import { enrichBranchRecords, schemaToBranchRecords } from "@/store/pure.js";
import { readSchema, createRoot } from "@/store/record.js";
import schemaRoot from "@/store/default_root_schema.json";

export async function find(uuid, reponame) {
  if (uuid === "root")
    return {
      repo: { _: "repo", repo: "root" },
      schema: schemaRoot,
    };

  const uuidPartial = uuid !== undefined ? { repo: uuid } : {};

  const namePartial = reponame !== undefined ? { reponame } : {};

  const query = {
    _: "repo",
    ...uuidPartial,
    ...namePartial,
  };

  // find uuid in root folder
  const [repo] = await api.select("root", query);

  const { repo: repoUUID } = repo;

  const schema = await readSchema(repoUUID);

  return { repo, schema };
}

export async function clone(repouuid, reponame, url, token) {
  // if no root here try to create
  await createRoot();

  // if uri specifies a remote
  // try to clone remote
  // where repo uuid is a digest of remote
  // and repo name is uri-encoded remote
  const encoded = new TextEncoder().encode(url);

  const repoUUIDRemote = repouuid ?? crypto.subtle.digest("SHA-256", encoded);

  await api.clone(repoUUIDRemote, reponame, url, token);

  const pathname = new URL(url).pathname;

  // get repo name from remote
  const reponameClone =
    reponame ?? pathname.substring(pathname.lastIndexOf("/") + 1);

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

  return { schema: schemaClone, repo: recordClone };
}
