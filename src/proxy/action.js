import { find, clone } from "@/proxy/open.js";
import { readSchema } from "@/proxy/record.js";
import { getDefaultBase, pickDefaultSortBy } from "@/proxy/pure.js";
import defaultMindRecord from "@/proxy/default_mind_record.json";

/**
 * This
 * @name changeMind
 * @function
 * @param {String} pathname -
 * @param {String} searchString -
 * @returns {object}
 */
export async function changeMind(api, pathname, searchString) {
  console.log("[proxy] changeMind", { pathname, searchString });
  const mind = pathname === "/" ? "root" : pathname.replace("/", "");

  const template = mind === "root" ? defaultMindRecord : {};

  const searchParams = new URLSearchParams(searchString);

  const remoteUrl = searchParams.get("~");

  const token = searchParams.get("-") ?? "";

  // SEC-12: validate clone URL is http(s) before auto-cloning
  let shouldClone = false;
  if (searchParams.has("~") && remoteUrl) {
    try {
      const parsed = new URL(remoteUrl);
      shouldClone = parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      // invalid URL — don't clone
    }
  }

  console.log("[proxy] changeMind", { mind, shouldClone });
  const { mind: mindRecord } = shouldClone
    ? await clone(api, undefined, remoteUrl, token)
    : await find(api, mind, undefined);
  console.log("[proxy] changeMind: mindRecord", mindRecord);

  const schema = await readSchema(api, mindRecord.mind);

  if (!searchParams.has("_")) {
    searchParams.set("_", getDefaultBase(schema));
  }

  if (!searchParams.has(".sortBy")) {
    searchParams.set(
      ".sortBy",
      pickDefaultSortBy(schema, searchParams.get("_")),
    );
  }

  return {
    mind: mindRecord,
    schema,
    searchParams,
    template,
  };
}
