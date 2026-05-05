import LightningFS from "@isomorphic-git/lightning-fs";
import { initFS } from "@/fs.js";
import { makeURL } from "@/pure.js";
import mindbook from "@fetsorn/mindbook";
import mindzoo from "@fetsorn/mindzoo";
import history from "history/hash";

function getBuildMode() {
  if (window.__TAURI_INTERNALS__) return "tauri";

  return "browser";
}

export default async function startEvenor() {
  const fs = initFS(new LightningFS("fs"));

  let crud = {};

  let book = {};

  let mind = "root";

  crud = {
    c: async (record) => {
      if (record.action === "open") {
        mind = record.record.mind;

        const description = await mindzoo.open(fs, mind);

        const url = makeURL(description.searchParams, mind);

        window.history.pushState(null, null, url);

        const actionPartial = mind === "root" ? ["open"] : [];

        book.open({ ...description, actions: actionPartial });
      }
    },
    r: async (record) => {
      return mindzoo.selectStream(fs, mind, record);
    },
    u: async (record) => {
      return mindzoo.updateRecord(fs, mind, record);
    },
    d: async (record) => {
      return mindzoo.deleteRecord(fs, mind, record);
    },
    describe: async (record) => {
      return mindzoo.buildRecord(fs, mind, record);
    },
  };

  book = await mindbook.create(crud);

  await mindzoo.createCatalog(fs);

  window.addEventListener("popstate", async () => {
    const mind =
      history.location.pathname === "/"
        ? "root"
        : history.location.pathname.replace("/", "");

    await crud.c({
      action: "open",
      record: { _: "mind", mind },
    });
  });

  window.dispatchEvent(
    new PopStateEvent("popstate", { state: { page: "dashboard" } }),
  );

  book.bind(document.getElementById("root"));
}
