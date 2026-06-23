import history from "history/hash";
import shajs from "sha.js";
import { v4 as uuidv4 } from "uuid";
import mindbook from "@fetsorn/mindbook";
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

let book;
let popstateHandler;
let active = false;

export async function mount(container, ctx) {
  const { fs, state } = ctx;

  active = true;

  let mind = "root";

  let schema = {};

  const crud = {
    c: async ({ action, record, searchParams: incomingParams }) => {
      if (action === "open") {
        mind = record.mind;
        state.mind = mind;

        // find mind in root folder — sparql returns a stream, collect first entry
        const [mindRecord] = await Array.fromAsync(
          await ctx.api.sparql({
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
        const focus = sp.get(".focus") ?? undefined;
        const query = sp.get("q") ?? "";

        const actionPartial =
          mind === "root"
            ? { mind: ["open", "archive", "restore", "pull", "push", "stats"] }
            : {};

        const onBack =
          mind === "root"
            ? null
            : async () => {
                await crud.c({
                  action: "open",
                  record: { _: "mind", mind: "root" },
                });

                await book.find("mind", "");
              };

        book.open({
          schema,
          base,
          sortBy,
          sortDirection,
          focus,
          query,
          template,
          actions: actionPartial,
          onBack,
        });
      }
      //should be on mind entry
      if (action === "archive") {
        book.status("archiving...");
        await ctx.api.archive(record.mind);
        book.status(null);
      }
      if (action === "restore") {
        book.status("restoring...");
        await ctx.api.restore(record.mind);
        book.status(null);
        // reopen root to refresh catalog
        await crud.c({ action: "open", record: { _: "mind", mind: "root" } });
      }
      if (action === "pull") {
        book.status("pulling...");
        await ctx.api.merge(record.mind, "theirs");
        book.status(null);
      }
      if (action === "push") {
        book.status("pushing...");
        await ctx.api.merge(record.mind, "ours");
        book.status(null);
      }
      if (action === "stats") {
        book.status("computing stats...");
        await ctx.api.computeStats();
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

        if (options.focus) {
          searchParams.set(".focus", options.focus);
        }

        const url = makeURL(searchParams, mind);

        window.history.pushState(null, null, url);
      }

      return ctx.api.sparql({ kind: "SELECT", graph: mind, query });
    },
    u: async (record) => {
      return ctx.api.sparql({ kind: "UPDATE", graph: mind, query: record });
    },
    d: async (record) => {
      return ctx.api.sparql({ kind: "DELETE", graph: mind, query: record });
    },
    describe: async (record) => {
      return ctx.api.sparql({ kind: "DESCRIBE", graph: mind, query: record });
    },
  };

  // Render the interface immediately — no white screen
  book = mindbook.create(crud);

  await book.bind(container);

  // Heavy backend initialization (seed, catalog rebuild)
  book.status("initializing...");

  try {
    ctx.api =
      getBuildMode() === "tauri"
        ? (await import("@/tauri/index.js")).default
        : await (
            await import("@/browser/index.js")
          ).default(fs, {
            seed: ctx.seed,
          });

    if (!active) return;

    state.apiReady = true;
  } catch (e) {
    console.error("initialization failed:", e);
    state.error = e;
    if (book) book.status(`error: ${e.message || e}`);
    return;
  }

  book.status(null);

  // Navigate and load data now that the backend is ready
  popstateHandler = async () => {
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
        await ctx.api.sparql({
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

        const cloneMind = newUUID();

        const mindRecord = {
          _: "mind",
          mind: cloneMind,
          name: "cloned",
          branch: [],
          origin_url: {
            _: "origin_url",
            origin_url: remoteUrl,
            origin_token: token,
          },
        };

        // induct + settle clones the remote content (including
        // the remote UUID), so no merge-theirs needed afterward
        await ctx.api.sparql({
          kind: "UPDATE",
          graph: "root",
          query: mindRecord,
        });

        // uuid may have changed — find the mind by origin
        const updated = await Array.fromAsync(
          await ctx.api.sparql({
            kind: "SELECT",
            graph: "root",
            query: { _: "mind" },
          }),
        );

        console.clone("select clone", updated);

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
          record: { _: "mind", mind: cloned ? cloned.mind : cloneMind },
        });
      }
    } else {
      const navMind =
        history.location.pathname === "/"
          ? "root"
          : history.location.pathname.replace("/", "");

      await crud.c({
        action: "open",
        record: { _: "mind", mind: navMind },
        searchParams,
      });

      await book.find("mind", "");
    }
  };

  window.addEventListener("popstate", popstateHandler);

  window.dispatchEvent(
    new PopStateEvent("popstate", { state: { page: "dashboard" } }),
  );
}

export function unmount() {
  active = false;
  if (popstateHandler) {
    window.removeEventListener("popstate", popstateHandler);
    popstateHandler = null;
  }
  book = null;
}
