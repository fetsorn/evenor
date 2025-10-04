import browser from "./browser/index.js";
import tauri from "./tauri/index.js";

// eslint-disable-next-line
const api = __BUILD_MODE__ === "tauri" ? tauri : browser;

// instead of exporting the api object
// destructure and reexport each method
// to make sure public API is safe and uniform
export const {
  zip,
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
  putAsset,
  setOrigin,
  getOrigin,
} = api;

export default {
  zip,
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
  putAsset,
  setOrigin,
  getOrigin,
};
