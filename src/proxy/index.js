import history from "history/hash";
import { deleteRecord, resolve } from "@/proxy/record.js";
//import { produce } from "solid-js/store";
import { buildRecord, updateRecord } from "@/proxy/impure.js";
import {
  //setProxyStore,
  onMindChange,
  onStartup,
  onMindOpen,
} from "@/proxy/store.js";

// this posts a record somewhere for special actions
async function c(ref, api, mind, record) {
  console.log("[proxy] c", {
    mind,
    action: record.action,
    record: record.record,
  });
  if (record.action === "open") {
    console.log("[proxy] c: opening mind", record.record.mind);
    const { schema, mind, searchParams, template } = await onMindOpen(
      api,
      record.record.mind,
    );
    console.log("[proxy] c: opened mind", record.record.mind);

    ref.book.open({ schema, mind, searchParams, template });
  }
}

async function r(api, mind, record) {
  console.log("[proxy] r", { mind, record });
  return api.selectStream(mind, record);

  // repair url clone
  //try {
  //  // if search bar can be parsed as url, clone
  //  const url = new URL(search);
  //  if (url.protocol === "http:" || url.protocol === "https:") {
  //    const searchString = url.hash.replace("#", "");
  //    //// reset searchbar to avoid a loop
  //    //// after onMindChange calls onSearch
  //    //setQueryStore(
  //    //  produce((state) => {
  //    //    state.searchBar = "";
  //    //  }),
  //    //);
  //    await onMindChange(api, "/", search);
  //    return undefined;
  //  }
  //  const url = makeURL(new URLSearchParams(search), mind);
  //  window.history.replaceState(null, null, url);
  //} catch (e) {
  //  console.log(e);
  //  // do nothing
  //}
}

async function u(api, mind, record) {
  console.log("[proxy] u", { mind, record });
  await updateRecord(api, mind, record);
  console.log("[proxy] u: done", { mind });

  try {
    const syncResult = await resolve(api, mind);

    //setProxyStore(
    //  produce((state) => {
    //    state.mergeResult = syncResult.ok;
    //    state.syncError = undefined;
    //  }),
    //);
  } catch (e) {
    // sync is best-effort after local save — surface but don't throw
    console.error("sync after save failed:", e);
    //setProxyStore("syncError", e?.message ?? String(e));
  }
}

async function d(api, mind, record) {
  console.log("[proxy] d", { mind, record });
  await deleteRecord(api, mind, record);
  console.log("[proxy] d: done", { mind });

  try {
    const syncResult = await resolve(api, mind);

    //setProxyStore(
    //  produce((state) => {
    //    state.mergeResult = syncResult.ok;
    //    state.syncError = undefined;
    //  }),
    //);
  } catch (e) {
    // sync is best-effort after local delete — surface but don't fail
    console.error("sync after delete failed:", e);
    //setProxyStore("syncError", e?.message ?? String(e));
  }
}

async function describe(api, mind, record) {
  return buildRecord(api, mind, record);
}

// currying for convenience
export default async (ref, provider) => {
  return {
    c: async (mind, record) => c(ref, provider, mind, record),
    r: async (mind, record) => r(provider, mind, record),
    u: async (mind, record) => u(provider, mind, record),
    d: async (mind, record) => d(provider, mind, record),
    describe: async (mind, record) => describe(provider, mind, record),
  };
};
