import browser from "./browser/index.js";
import tauri from "./tauri/index.js";

const api = __BUILD_MODE__ === "tauri" ? tauri : browser;

export default api;
