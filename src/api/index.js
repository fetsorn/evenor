import browser from "./browser/index.js";
import tauri from "./tauri/index.js";

const api = __BUILD_MODE__ === "tauri" ? tauri : browser;

// reexport each method again to make sure it's safe and uniform
export const {
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
  ensure,
  clone,
  commit,
  push,
  pull,
  fetchAsset,
  listRemotes,
  addRemote,
  getRemote,
} = api;

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
  ensure,
  clone,
  commit,
  push,
  pull,
  fetchAsset,
  listRemotes,
  addRemote,
  getRemote,
};
