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

export async function init(uuid, name) {
  return invoke("init", { uuid, name });
}

export async function createLFS(uuid, name) {
  return invoke("create_lfs", { uuid, name });
}

export async function commit(uuid) {
  return invoke("commit", { uuid });
}

// fresh clone from url to uuid dir, symlink to name
export async function clone(uuid, remoteUrl, remoteToken, name) {
  return invoke("clone", {
    uuid,
    name,
    remote: {
      url: remoteUrl,
      token: remoteToken,
    },
  });
}

export async function push(uuid) {
  return invoke("push", { uuid });
}

export async function pull(uuid) {
  return invoke("pull", { uuid });
}

export async function uploadBlobsLFS(uuid, remote, files) {
  return invoke("upload_blobs_LFS", { uuid, remote, files });
}

export async function zip(uuid) {
  return invoke("zip", { uuid });
}

export async function setOrigin(uuid, remoteUrl, remoteToken) {
  return invoke("set_origin", {
    uuid,
    remote: {
      url: remoteUrl,
      token: remoteToken,
    },
  });
}

export async function getOrigin(uuid) {
  return invoke("get_origin", { uuid });
}

export async function setAssetPath(uuid, assetPath) {
  return invoke("set_asset_path", { uuid, assetPath });
}

export async function getAssetPath(uuid) {
  return invoke("get_asset_path", { uuid });
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
  setAssetPath,
  getAssetPath,
  select,
  selectStream,
  updateRecord,
  deleteRecord,
  init,
  createLFS,
  clone,
  commit,
  push,
  pull,
  fetchAsset,
  setOrigin,
  getOrigin,
};
