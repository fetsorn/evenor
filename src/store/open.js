import api from "../api/index.js";
import { enrichBranchRecords, schemaToBranchRecords } from "./pure.js";
import {
  readSchema,
  createRoot,
  updateRepo,
  saveRepoRecord,
} from "./record.js";

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

export async function cloneAndOpen(url, token) {
  // if uri specifies a remote
  // try to clone remote
  // where repo uuid is a digest of remote
  // and repo name is uri-encoded remote
  const encoded = new TextEncoder().encode(url);

  const repoUUIDRemote = crypto.subtle.digest("SHA-256", encoded);

  try {
    // if no root here try to create
    await createRoot();

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
  } catch (e) {
    // proceed to choose root repo uuid
    console.log(e);
  }
}
