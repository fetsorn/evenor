import history from "history/hash";
import { v4 as uuidv4 } from "uuid";
import shajs from "sha.js";
import LightningFS from "@isomorphic-git/lightning-fs";
import mindbook from "@fetsorn/mindbook";
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

export function newUUID() {
  return shajs("sha256").update(uuidv4()).digest("hex");
}

export default async function startEvenor() {
  const fs = initFS(new LightningFS("fs"));

  const api =
    getBuildMode() === "tauri"
      ? (await import("@/tauri/index.js")).default
      : await (await import("@/browser/index.js")).default(fs);

  let crud = {};

  let book = {};

  let mind = "root";

  crud = {
    c: async ({ action, record }) => {
      if (action === "open") {
        mind = record.mind;

        // find mind in root folder — sparql returns a stream, collect first entry
        const [mindRecord] = await Array.fromAsync(
          await api.sparql({
            kind: "DESCRIBE",
            graph: "root",
            query: { _: "mind", mind: record.mind },
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

        const actionPartial = { mind: ["open", "archive", "restore"] };

        book.open({ schema, searchParams, template, actions: actionPartial });
      }
      //should be on mind entry
      if (action === "archive") {
        await api.archive(record.mind);
      }
      if (action === "restore") {
        await api.restore(record.mind);
        // reopen root to refresh catalog
        await crud.c({ action: "open", record: { _: "mind", mind: "root" } });
      }
      //should be on event or file entry to add lfs asset
      //if (record.action === "load") {
      // const files = pickFile();
      //}
    },
    r: async (record) => {
      return api.sparql({ kind: "SELECT", graph: mind, query: record });
    },
    u: async (record) => {
      return api.sparql({ kind: "UPDATE", graph: mind, query: record });
    },
    d: async (record) => {
      return api.sparql({ kind: "DELETE", graph: mind, query: record });
    },
    describe: async (record) => {
      return api.sparql({ kind: "DESCRIBE", graph: mind, query: record });
    },
  };

  book = await mindbook.create(crud);

  window.addEventListener("popstate", async () => {
    const searchParams = new URLSearchParams(history.location.search);

    const remoteUrl = searchParams.get("~");

    const token = searchParams.get("-") ?? "";

    // SEC-12: validate clone URL is http(s) before auto-cloning
    let shouldClone = false;
    if (searchParams.has("~") && remoteUrl) {
      try {
        const parsed = new URL(remoteUrl);
        shouldClone =
          parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        // invalid URL — don't clone
      }
    }

    if (shouldClone) {
      // replace uuid with .csvs.csv
      const mind = newUUID();

      const mindRecord = {
        _: "mind",
        mind,
        name: "cloned",
        origin_url: {
          _: "origin_url",
          origin_url: remoteUrl,
          origin_token: token,
        },
      };

      await api.sparql({ kind: "UPDATE", graph: "root", query: mindRecord });

      await crud.c({
        action: "open",
        record: { _: "mind", mind },
      });
    } else {
      const mind =
        history.location.pathname === "/"
          ? "root"
          : history.location.pathname.replace("/", "");

      await crud.c({
        action: "open",
        record: { _: "mind", mind },
      });
    }
  });

  window.dispatchEvent(
    new PopStateEvent("popstate", { state: { page: "dashboard" } }),
  );

  book.bind(document.getElementById("root"));
}
