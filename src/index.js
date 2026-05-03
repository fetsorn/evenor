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

  crud = {
    c: async (mind, record) => {
      if (record.action === "open") {
        const description = await mindzoo.open(fs, record.record.mind);

        const url = makeURL(description.searchParams, description.mind.mind);

        window.history.pushState(null, null, url);

        book.open(description);
      }
    },
    r: async (mind, record) => {
      return mindzoo.selectStream(fs, mind, record);
    },
    u: async (mind, record) => {
      return mindzoo.updateRecord(fs, mind, record);
    },
    d: async (mind, record) => {
      return mindzoo.deleteRecord(fs, mind, record);
    },
    describe: async (mind, record) => {
      console.log(mindzoo);
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

    console.log(crud);
    await crud.c("root", {
      action: "open",
      record: { _: "mind", mind },
    });
  });

  window.dispatchEvent(
    new PopStateEvent("popstate", { state: { page: "dashboard" } }),
  );

  book.bind(document.getElementById("root"));
}
