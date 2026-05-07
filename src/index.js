import history from "history/hash";
import LightningFS from "@isomorphic-git/lightning-fs";
import mindbook from "@fetsorn/mindbook";
import mindzoo from "@fetsorn/mindzoo";
import { initFS } from "@/fs.js";
import {
  makeURL,
  recordsToSchema,
  extractSchemaRecords,
  pickDefaultSortBy,
  pickDefaultBase,
} from "@/pure.js";
import defaultMindRecord from "@/default_mind_record.json";

function getBuildMode() {
  if (window.__TAURI_INTERNALS__) return "tauri";

  return "browser";
}

export default async function startEvenor() {
  const fs = initFS(new LightningFS("fs"));

  const zoo =
    getBuildMode() === "tauri"
      ? (await import("@/tauri.js")).default
      : await mindzoo({ fs, dir: "/" });

  let crud = {};

  let book = {};

  let mind = "root";

  crud = {
    c: async ({ action, record }) => {
      if (action === "open") {
        mind = record.mind;

        // find mind in root folder — sparql returns a stream, collect first entry
        const [mindRecord] = await Array.fromAsync(
          await zoo.sparql({
            kind: "DESCRIBE",
            graph: "root",
            query: record,
          }),
        );

        // TODO merge extractSchemaRecords and recordsToSchema
        const [schemaRecord, ...metaRecords] = extractSchemaRecords(
          mindRecord.branch,
        );

        const schema = recordsToSchema(schemaRecord, metaRecords);

        const template = mind === "root" ? defaultMindRecord : {};

        const searchParams = new URLSearchParams();

        if (!searchParams.has("_")) {
          searchParams.set("_", pickDefaultBase(schema));
        }

        if (!searchParams.has(".sortBy")) {
          searchParams.set(
            ".sortBy",
            pickDefaultSortBy(schema, searchParams.get("_")),
          );
        }

        const url = makeURL(searchParams, mind);

        window.history.pushState(null, null, url);

        const actionPartial = mind === "root" ? ["open"] : [];

        book.open({ schema, searchParams, template, actions: actionPartial });
      }
      //should be on mind entry
      //if (record.action === "save") {
      //  import { saveAs } from "file-saver";
      //  const zip = await zoo.catalog.export({ mind: record.record.mind })
      //  saveAs(content, "archive.zip");
      //}
      //should be on event or file entry to add lfs asset
      //if (record.action === "load") {
      // const files = pickFile();
      //}
    },
    r: async (record) => {
      return zoo.sparql({ kind: "SELECT", graph: mind, query: record });
    },
    u: async (record) => {
      return zoo.sparql({ kind: "UPDATE", graph: mind, query: record });
    },
    d: async (record) => {
      return zoo.sparql({ kind: "DELETE", graph: mind, query: record });
    },
    describe: async (record) => {
      return zoo.sparql({ kind: "DESCRIBE", graph: mind, query: record });
    },
  };

  book = await mindbook.create(crud);

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
