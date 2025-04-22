import { invoke, Channel } from "@tauri-apps/api/core";

export async function helloWorld(uuid, someVariable = "") {
  return invoke("hello_world", { someVariable });
}

export async function fetchAsset(uuid, filename) {
  return invoke("fetch_asset", { uuid, filename });
}

export async function downloadAsset(uuid, content, filename) {
  return invoke("download_asset", { uuid, content, filename });
}

export async function putAsset(uuid, filename, buffer) {
  return invoke("put_asset", { uuid, filename, buffer });
}

export async function uploadFile(uuid) {
  return invoke("upload_file", { uuid });
}

export async function select(uuid, query) {
  return invoke("select", { uuid, query });
}

export async function selectStream(uuid, query) {
  let closeHandler;

  return {
    strm: new ReadableStream({
      async start(controller) {
        const onEvent = new Channel();

        onEvent.onmessage = (message) => {
          if (message.event === "progress") {
            controller.enqueue(message.data.entry);
          } else if (message.event === "finished") {
            controller.close();
          }
        };

        closeHandler = () => {
          try {
            controller.close();
          } catch {
            // do nothing
          }
        };

        return invoke("select_stream", {
          uuid,
          query,
          onEvent,
        });
      },
    }),
    closeHandler,
  };
}

export async function updateRecord(uuid, record) {
  return invoke("update_record", { uuid, record });
}

export async function deleteRecord(uuid, record) {
  return invoke("delete_record", { uuid, record });
}

export async function createRepo(uuid, name) {
  return invoke("createRepo", { uuid, name });
}

export async function createLFS(uuid, name) {
  return invoke("createLFS", { uuid, name });
}

export async function commit(uuid) {
  return invoke("commit", { uuid });
}

// fresh clone from url to uuid dir, symlink to name
export async function clone(uuid, remoteUrl, remoteToken, name) {
  return invoke("clone", {
    uuid,
    remoteUrl,
    remoteToken: "",
    name,
  });
}

export async function push(uuid, remote) {
  return invoke("push", { uuid, remote });
}

export async function pull(uuid, remote) {
  return invoke("pull", { uuid, remote });
}

export async function uploadBlobsLFS(uuid, remote, files) {
  return invoke("upload_blobs_LFS", { uuid, remote, files });
}

export async function zip(uuid) {
  return invoke("zip", { uuid });
}

export async function listRemotes(uuid) {
  return invoke("list_remotes", { uuid });
}

export async function addRemote(uuid, remoteName, remoteUrl, remoteToken) {
  return invoke("add_remote", {
    uuid,
    remoteName,
    remoteUrl,
    remoteToken,
  });
}

export async function getRemote(uuid, remote) {
  return invoke("get_remote", { uuid, remote });
}

export async function addAssetPath(uuid, assetPath) {
  return invoke("add_asset_path", { uuid, assetPath });
}

export async function listAssetPaths(uuid) {
  return invoke("list_asset_paths", { uuid });
}

export async function downloadUrlFromPointer(url, token, pointerInfo) {
  return invoke("download_url_from_pointer", {
    url,
    token,
    pointerInfo,
  });
}

export default {
  zip,
  putAsset,
  uploadFile,
  uploadBlobsLFS,
  downloadAsset,
  downloadUrlFromPointer,
  addAssetPath,
  listAssetPaths,
  select,
  selectStream,
  updateRecord,
  deleteRecord,
  createRepo,
  createLFS,
  clone,
  commit,
  push,
  pull,
  fetchAsset,
  listRemotes,
  addRemote,
  getRemote,
};
