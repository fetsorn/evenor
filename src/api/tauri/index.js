import { invoke, Channel } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";

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
  return invoke("selectStream", { mind, query });
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
export async function clone(mind, remote) {
  return invoke("clone", { mind, remote });
}

export async function rename(mind, source) {
  return invoke("rename", { mind, source });
}

export async function resolve(mind, remote, resolutions) {
  return invoke("resolve", { mind, remote, resolutions });
}

export async function uploadBlobsLFS(mind, remote, files) {
  return invoke("upload_blobs_LFS", { mind, remote, files });
}

export async function zip(mind) {
  return invoke("zip", { mind });
}

export async function setOrigin(mind, remote) {
  return invoke("set_origin", {
    mind,
    remote,
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
  resolve,
  rename,
  fetchAsset,
  setOrigin,
  getOrigin,
};
