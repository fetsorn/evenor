/**
 * Parse search bar text and build queries for the csvs engine.
 *
 * @module query
 */
import { findCrown } from "@fetsorn/csvs-js";

/**
 * Parse a GitHub-style query string into keyword filters and freeform terms.
 * "hello date:2024 world" with keywords ["date","name"]
 *   => { filters: { date: "2024" }, freeform: ["hello", "world"] }
 *
 * Rules:
 *   - "key:value" where key is a known keyword => filter
 *   - "key:" where key is a known keyword => filter with empty value
 *   - bare word (no colon, or colon prefix not a keyword) => freeform
 *
 * @param {string} text - raw search bar text
 * @param {string[]} keywords - known keyword names from schema
 * @returns {{ filters: Object<string,string>, freeform: string[] }}
 */
export function parseQueryString(text, keywords) {
  const filters = {};
  const freeform = [];

  if (!text || !text.trim()) return { filters, freeform };

  // tokenize: split on whitespace, but respect quoted values
  const tokenRegex = /(\S+:"(?:[^"\\]|\\.)*"|\S+:'(?:[^'\\]|\\.)*'|\S+)/g;
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    const token = match[1];
    const colonIndex = token.indexOf(":");

    if (colonIndex !== -1) {
      const key = token.slice(0, colonIndex);
      let value = token.slice(colonIndex + 1);

      // strip surrounding quotes from value
      value = value.replace(/^["']|["']$/g, "");

      if (keywords.includes(key)) {
        filters[key] = value;
      } else {
        freeform.push(token);
      }
    } else {
      freeform.push(token);
    }
  }

  return { filters, freeform };
}

// ---- Path tracing (shared logic with algebra.js) ----

/**
 * Check if ancestor is reachable from branch by walking trunks upward.
 */
function isAncestor(schema, ancestor, branch) {
  if (branch === ancestor) return true;

  const trunks = schema[branch]?.trunks ?? [];

  return trunks.some((t) => isAncestor(schema, ancestor, t));
}

/**
 * Trace a branch back to the base through its trunks, returning the chain
 * of intermediate branches (excluding the base itself).
 *
 * E.g. for base="mind", branch="coordinates":
 *   schema: mind -> location -> coordinates
 *   returns ["location", "coordinates"]
 *
 * @param {object} schema
 * @param {string} base
 * @param {string} branch
 * @returns {string[]} chain from base's direct leaf down to branch
 */
export function pathFromBase(schema, base, branch) {
  if (branch === base) return [];

  const chain = [];
  let current = branch;

  while (current !== base) {
    chain.unshift(current);
    const trunks = schema[current]?.trunks ?? [];
    const next = trunks.find((t) => t === base || isAncestor(schema, base, t));

    if (next === undefined) break;
    current = next;
  }

  return chain;
}

// ---- QON fragment merging ----

/**
 * Deep-merge two QON values that share the same key.
 *
 * Cases:
 *   string + object  → string becomes a field on the object
 *     "paris" + { _: "location", coordinates: "48" }
 *     → { _: "location", location: "paris", coordinates: "48" }
 *
 *   object + object  → merge fields (recurse on shared keys)
 *     { _: "location", coordinates: "48" } + { _: "location", altitude: "100" }
 *     → { _: "location", coordinates: "48", altitude: "100" }
 *
 *   string + string  → array (OR in csvs)
 *     "paris" + "london" → ["paris", "london"]
 *
 * @param {string} key - the branch name these values live under
 * @param {*} existing - current value
 * @param {*} incoming - new value to merge
 * @returns {*} merged value
 */
function mergeQonValues(key, existing, incoming) {
  const existingIsObject =
    typeof existing === "object" && !Array.isArray(existing);
  const incomingIsObject =
    typeof incoming === "object" && !Array.isArray(incoming);

  if (existingIsObject && incomingIsObject) {
    // deep merge two objects
    const merged = { ...existing };

    for (const [k, v] of Object.entries(incoming)) {
      if (k === "_") continue; // keep existing base
      if (k in merged) {
        merged[k] = mergeQonValues(k, merged[k], v);
      } else {
        merged[k] = v;
      }
    }

    return merged;
  }

  if (existingIsObject && !incomingIsObject) {
    // string merges into object as a field: { _: "location", location: "paris" }
    return { ...existing, [key]: incoming };
  }

  if (!existingIsObject && incomingIsObject) {
    // object absorbs the string as a field
    return { ...incoming, [key]: existing };
  }

  // both strings — combine as array (OR)
  const existingArr = Array.isArray(existing) ? existing : [existing];

  return [...existingArr, incoming];
}

/**
 * Merge a QON fragment into an accumulator query, handling shared keys
 * by deep-merging nested objects.
 */
function mergeFragment(query, fragment) {
  const merged = { ...query };

  for (const [key, value] of Object.entries(fragment)) {
    if (key === "_") continue; // don't overwrite base

    if (key in merged) {
      merged[key] = mergeQonValues(key, merged[key], value);
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

// ---- QON building ----

/**
 * Build a nested QON fragment for a single keyword filter.
 *
 * For a direct leaf of base (e.g. base="mind", key="date", value="2024"):
 *   { date: "2024" }
 *
 * For a nested branch (e.g. base="mind", key="coordinates", value="48.8"):
 *   { location: { _: "location", coordinates: "48.8" } }
 *
 * Returns only the filter fragment (no _ field) — caller merges into the query.
 *
 * @param {object} schema
 * @param {string} base
 * @param {string} key - the keyword branch name
 * @param {string} value - the filter value (regex string)
 * @returns {object} partial QON to merge into the base query
 */
function keywordToQon(schema, base, key, value) {
  if (key === base) {
    return { [base]: value };
  }

  const chain = pathFromBase(schema, base, key);

  if (chain.length === 0) return {};

  if (chain.length === 1) {
    // direct leaf of base: { key: value }
    return { [key]: value };
  }

  // chain has multiple steps, e.g. ["location", "coordinates"]
  // Build inside-out.
  // Innermost: { _: trunk-of-key, key: value }
  //   e.g. { _: "location", coordinates: "48.8" }
  let inner = { _: chain[chain.length - 2], [key]: value };

  // Wrap outward through remaining intermediates
  //   e.g. chain ["a", "b", "c"] with key="c":
  //     inner = { _: "b", c: value }
  //     → { _: "a", b: { _: "b", c: value } }
  for (let i = chain.length - 3; i >= 0; i--) {
    inner = { _: chain[i], [chain[i + 1]]: inner };
  }

  // Return fragment keyed by the direct leaf of base
  return { [chain[0]]: inner };
}

/**
 * Build a QON query from parsed query + base + schema.
 *
 * Keyword filters are ANDed as fields on the base object, with nesting
 * for branches that aren't direct leaves of base. Multiple keywords
 * sharing a path prefix are deep-merged.
 *
 * Freeform terms produce a UNION (array of QON objects), one per reachable
 * branch, each with a regex filter on that branch.
 *
 * @param {string} base - the base type (e.g. "mind")
 * @param {{ filters: Object, freeform: string[] }} parsed
 * @param {object} schema
 * @returns {object|object[]} QON record or array of QON records (union)
 */
export function buildQuery(base, parsed, schema) {
  // start with base query
  let query = { _: base };

  // apply keyword filters with deep merge
  for (const [key, value] of Object.entries(parsed.filters)) {
    const fragment = keywordToQon(schema, base, key, value);

    query = mergeFragment(query, fragment);
  }

  // if no freeform terms, return the keyword-only query
  if (parsed.freeform.length === 0) {
    return query;
  }

  // freeform: concatenate as a single substring match
  // TODO: AND per-word across branches (requires query intersection)
  const regexPattern = parsed.freeform.join(" ");
  const crown = findCrown(schema, base);

  // skip branches already constrained by a keyword filter
  const searchBranches = crown.filter((b) => !(b in parsed.filters));

  if (searchBranches.length === 0) {
    // all branches already filtered, just add freeform to base value + prose
    const baseArm = { ...query, [base]: regexPattern };
    const proseArm = { ...query, "@": regexPattern };
    return [baseArm, proseArm];
  }

  // produce one QON per branch (union) + base value + prose
  const arms = searchBranches.map((branch) => {
    const fragment = keywordToQon(schema, base, branch, regexPattern);

    return mergeFragment(query, fragment);
  });

  // search the base value itself
  arms.push({ ...query, [base]: regexPattern });

  // search untagged prose descriptions
  arms.push({ ...query, "@": regexPattern });

  return arms;
}
