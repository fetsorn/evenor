//import { createContext } from "solid-js";
//import { createStore, produce } from "solid-js/store";
import { createRoot } from "@/proxy/record.js";
import { readSchema } from "@/proxy/record.js";
import { resolve } from "@/proxy/record.js";
import { changeMind } from "@/proxy/action.js";
import { makeURL, getDefaultBase } from "@/proxy/pure.js";

//export const ProxyContext = createContext();
//
//export const [proxyStore, setProxyStore] = createStore({
//  mergeResult: false,
//  syncError: undefined,
//});

/**
 * This
 * @name onStartup
 * @export function
 */
export async function onStartup(api) {
  await createRoot(api);
}

/**
 * This
 * @name onMindChange
 * @export function
 * @param {String} pathname -
 * @param {String} searchString -
 */
export async function onMindChange(api, pathname, searchString) {
  console.log("[proxy] onMindChange", { pathname, searchString });
  //  await queryStore.abortPreviousStream();

  //setQueryStore(
  //  produce((state) => {
  //    // this updates the overview on change of params
  //    // and removes focus from the filter
  //    // erase searchParams to re-render the filter index
  //    state.searchParams = "";
  //    // erase records to re-render the overview
  //    state.recordSet = [];
  //    state.record = undefined;
  //  }),
  //);

  let result;

  // in case of error fallback to root
  try {
    result = await changeMind(api, pathname, searchString);
  } catch (e) {
    console.error("[proxy] onMindChange: changeMind failed", e);

    // TODO set template to defaultroot
    result = await changeMind(api, "/", "_=mind");
  }

  const { mind, schema, searchParams, template } = result;

  try {
    const syncResult = await resolve(api, mind.mind);

    //setProxyStore(
    //  produce((state) => {
    //    state.mergeResult = syncResult.ok;
    //    state.syncError = undefined;
    //  }),
    //);
  } catch (e) {
    // sync is best-effort on navigation — surface but don't fail
    console.error("sync on mind change failed:", e);
    //setProxyStore("syncError", e?.message ?? String(e));
  }

  const url = makeURL(searchParams, mind.mind);

  window.history.pushState(null, null, url);

  return { mind, schema, searchParams, template };

  // TODO move to onMount if config true
  //// only search by default in the root mind
  //if (mind.mind === "root") {
  //  // start a search stream
  //  await onSearch(api);
  //}
}

export async function onMindOpen(api, mind) {
  console.log("[proxy] onMindOpen", { mind });
  const schema = await readSchema(api, mind);
  console.log("[proxy] onMindOpen: schema", schema);

  const base = await getDefaultBase(schema);
  console.log("[proxy] onMindOpen: base", base);

  return onMindChange(api, `/${mind}`, `_=${base}`);
}
