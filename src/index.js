import browser from "./browser/index.js";
import tauri from "./tauri/index.js";

function getBuildMode() {
  if (window.__TAURI_INTERNALS__) return "tauri";

  return "browser";
}

const startEvenor = getBuildMode() === "browser" ? browser : tauri;

export default startEvenor;
