import { invoke, Channel } from "@tauri-apps/api/core";

export async function helloWorld(mind, someVariable = "") {
  return invoke("hello_world", { someVariable });
}

export async function fetchAsset(mind, filename) {
  return invoke("fetch_asset", { mind, filename });
}

export async function downloadAsset(mind, content, filename) {
  return invoke("download_asset", { mind, content, filename });
}

export async function putAsset(mind, filename, buffer) {
  return invoke("put_asset", { mind, filename, buffer });
}

export async function uploadFile(mind) {
  return invoke("upload_file", { mind });
}

export async function select(mind, query) {
  return invoke("select", { mind, query });
}

export async function selectStream(mind, query) {
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
          mind,
          query,
          onEvent,
        });
      },
    }),
    closeHandler,
  };
}

export async function updateRecord(mind, record) {
  return invoke("update_record", { mind, record });
}

export async function deleteRecord(mind, record) {
  return invoke("delete_record", { mind, record });
}

export async function init(mind, name) {
  return invoke("init", { mind, name });
}

export async function createLFS(mind, name) {
  return invoke("create_lfs", { mind, name });
}

export async function commit(mind) {
  return invoke("commit", { mind });
}

// fresh clone from url to mind dir, symlink to name
export async function clone(mind, remoteUrl, remoteToken, name) {
  return invoke("clone", {
    mind,
    name,
    remote: {
      url: remoteUrl,
      token: remoteToken,
    },
  });
}

export async function push(mind) {
  return invoke("push", { mind });
}

export async function pull(mind) {
  return invoke("pull", { mind });
}

export async function uploadBlobsLFS(mind, remote, files) {
  return invoke("upload_blobs_LFS", { mind, remote, files });
}

export async function zip(mind) {
  return invoke("zip", { mind });
}

export async function setOrigin(mind, remoteUrl, remoteToken) {
  return invoke("set_origin", {
    mind,
    remote: {
      url: remoteUrl,
      token: remoteToken,
    },
  });
}

export async function getOrigin(mind) {
  return invoke("get_origin", { mind });
}

export async function setAssetPath(mind, assetPath) {
  return invoke("set_asset_path", { mind, assetPath });
}

export async function getAssetPath(mind) {
  return invoke("get_asset_path", { mind });
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
