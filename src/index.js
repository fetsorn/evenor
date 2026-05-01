import mindbook from "@fetsorn/mindbook";
import history from "history/hash";
import browser from "@/browser/index.js";
import tauri from "@/tauri/index.js";
import { onStartup, onMindChange } from "@/proxy/store.js";
import crud from "@/proxy/index.js";

function getBuildMode() {
  if (window.__TAURI_INTERNALS__) return "tauri";

  return "browser";
}

export default async function startEvenor() {
  const provider = getBuildMode() === "browser" ? browser() : tauri();

  await onStartup(provider);

  const ref = { book: null };

  const api = await crud(ref, provider);

  ref.book = await mindbook.create(api);

  ref.book.bind(document.getElementById("root"));

  const { schema, mind, searchParams, template } = await onMindChange(
    provider,
    history.location.pathname,
    history.location.search,
  );

  ref.book.open({ schema, mind, searchParams, template });

  window.addEventListener("popstate", async () => {
    const { schema, mind, searchParams, template } = await onMindChange(
      provider,
      history.location.pathname,
      history.location.search,
    );

    ref.book.open({ schema, mind, searchParams, template });
  });
}
