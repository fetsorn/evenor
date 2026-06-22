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
import { parseQueryString, buildQuery } from "@/query.js";
import defaultMindRecord from "@/default_mind_record.json";

function getBuildMode() {
  if (window.__TAURI_INTERNALS__) return "tauri";

  return "browser";
}

export function newUUID() {
  return shajs("sha256").update(uuidv4()).digest("hex");
}

export default async function startEvenor({ seed = true } = {}) {
  const fs = initFS(new LightningFS("fs"));

  let api;

  let mind = "root";

  let schema = {};

  let book;

  const crud = {
    c: async ({ action, record, searchParams: incomingParams }) => {
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

        schema = recordsToSchema(schemaRecord, metaRecords);

        const template = mind === "root" ? defaultMindRecord : {};

        const sp = incomingParams ?? new URLSearchParams();

        const base = sp.get("_") ?? pickDefaultBase(schema);
        const sortBy = sp.get(".sortBy") ?? pickDefaultSortBy(schema, base);
        const sortDirection = sp.get(".sortDirection") ?? undefined;
        const scroll = sp.get(".scroll") ?? undefined;
        const query = sp.get("q") ?? "";

        const actionPartial =
          mind === "root"
            ? { mind: ["open", "archive", "restore", "pull", "push", "stats"] }
            : {};

        book.open({
          schema,
          base,
          sortBy,
          sortDirection,
          scroll,
          query,
          template,
          actions: actionPartial,
        });
      }
      //should be on mind entry
      if (action === "archive") {
        book.status("archiving...");
        await api.archive(record.mind);
        book.status(null);
      }
      if (action === "restore") {
        book.status("restoring...");
        await api.restore(record.mind);
        book.status(null);
        // reopen root to refresh catalog
        await crud.c({ action: "open", record: { _: "mind", mind: "root" } });
      }
      if (action === "pull") {
        book.status("pulling...");
        await api.merge(record.mind, "theirs");
        book.status(null);
      }
      if (action === "push") {
        book.status("pushing...");
        await api.merge(record.mind, "ours");
        book.status(null);
      }
      if (action === "stats") {
        book.status("computing stats...");
        await api.computeStats();
        book.status(null);
        // reopen root to show updated stats
        await crud.c({ action: "open", record: { _: "mind", mind: "root" } });
      }
      //should be on event or file entry to add lfs asset
      //if (record.action === "load") {
      // const files = pickFile();
      //}
    },
    r: async (base, queryString, options) => {
      const keywords = Object.keys(schema);

      const parsed = parseQueryString(queryString, keywords);

      const query = buildQuery(base, parsed, schema);

      if (options?.register) {
        const searchParams = new URLSearchParams();

        searchParams.set("_", base);

        if (queryString) {
          searchParams.set("q", queryString);
        }

        const url = makeURL(searchParams, mind);

        window.history.pushState(null, null, url);
      }

      return api.sparql({ kind: "SELECT", graph: mind, query });
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

  // Render the interface immediately — no white screen
  book = mindbook.create(crud);

  await book.bind(document.getElementById("root"));

  // Heavy backend initialization (seed, catalog rebuild)
  book.status("initializing...");

  api =
    getBuildMode() === "tauri"
      ? (await import("@/tauri/index.js")).default
      : await (await import("@/browser/index.js")).default(fs, { seed });

  book.status(null);

  // Navigate and load data now that the backend is ready
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
      // check if a mind with this origin already exists
      const existing = await Array.fromAsync(
        await api.sparql({
          kind: "SELECT",
          graph: "root",
          query: { _: "mind" },
        }),
      );

      const found = existing.find((r) => {
        const url = r.origin_url;
        return (
          url &&
          (typeof url === "string"
            ? url === remoteUrl
            : url.origin_url === remoteUrl)
        );
      });

      if (found) {
        await crud.c({
          action: "open",
          record: { _: "mind", mind: found.mind },
        });
      } else {
        book.status("cloning...");

        const mind = newUUID();

        const mindRecord = {
          _: "mind",
          mind,
          name: "cloned",
          branch: [],
          origin_url: {
            _: "origin_url",
            origin_url: remoteUrl,
            origin_token: token,
          },
        };

        await api.sparql({ kind: "UPDATE", graph: "root", query: mindRecord });

        await api.merge(mind, "theirs");

        // after merge theirs, uuid may have changed — find the mind by origin
        const updated = await Array.fromAsync(
          await api.sparql({
            kind: "SELECT",
            graph: "root",
            query: { _: "mind" },
          }),
        );

        const cloned = updated.find((r) => {
          const url = r.origin_url;
          return (
            url &&
            (typeof url === "string"
              ? url === remoteUrl
              : url.origin_url === remoteUrl)
          );
        });

        book.status(null);

        await crud.c({
          action: "open",
          record: { _: "mind", mind: cloned ? cloned.mind : mind },
        });
      }
    } else {
      const mind =
        history.location.pathname === "/"
          ? "root"
          : history.location.pathname.replace("/", "");

      await crud.c({
        action: "open",
        record: { _: "mind", mind },
        searchParams,
      });

      await book.find("mind", "");
    }
  });

  window.dispatchEvent(
    new PopStateEvent("popstate", { state: { page: "dashboard" } }),
  );
}
