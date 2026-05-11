/**
 * Convert parsed query into SPARQL algebra using Traqula's AlgebraFactory.
 *
 * Freeform terms OR across all reachable branches (the "crown").
 * Keyword filters AND as triple patterns, with path-chaining for nested branches.
 *
 * Uses pathFromBase from query.js for shared path-tracing logic.
 *
 * @module algebra
 */
import { AlgebraFactory } from "@traqula/algebra-transformations-1-1";
import { DataFactory } from "rdf-data-factory";
import { findCrown } from "@fetsorn/csvs-js";
import { pathFromBase } from "./query.js";

const df = new DataFactory();
const af = new AlgebraFactory(df);

// ---- Helpers ----

function iri(namespace, branch) {
  return df.namedNode(`${namespace}#${branch}`);
}

function str(value) {
  return df.literal(value);
}

/**
 * Build SPARQL triple patterns for a path from base to branch,
 * using the shared pathFromBase helper.
 *
 * E.g. for coordinates → location → mind:
 *   ?mind <#location> ?location_v .
 *   ?location_v <#coordinates> ?coordinates_v .
 *
 * @param {object} schema
 * @param {string} base
 * @param {string} branch
 * @param {string} namespace
 * @returns {{ patterns: Pattern[], leafVar: Variable }}
 */
function pathPatterns(schema, base, branch, namespace) {
  const chain = pathFromBase(schema, base, branch);
  const patterns = [];

  let subjectVar = df.variable(base);

  for (const step of chain) {
    const objectVar = df.variable(`${step}_v`);

    patterns.push(af.createPattern(subjectVar, iri(namespace, step), objectVar));
    subjectVar = objectVar;
  }

  return { patterns, leafVar: subjectVar };
}

/**
 * Build patterns for a keyword filter, handling nested branches.
 * For a direct leaf: ?mind <#date> "2024" .
 * For nested: ?mind <#location> ?location_v . ?location_v <#coordinates> "48.8" .
 */
function keywordFilterPatterns(schema, base, key, value, namespace) {
  if (key === base) {
    // filter on the base value directly
    const obj = value === "" ? df.variable(`${key}_v`) : str(value);

    return [af.createPattern(df.variable(base), iri(namespace, key), obj)];
  }

  const { patterns, leafVar } = pathPatterns(schema, base, key, namespace);

  // replace the last pattern's object with the literal value (or keep variable for empty)
  if (value !== "" && patterns.length > 0) {
    const last = patterns[patterns.length - 1];
    const replaced = af.createPattern(last.subject, last.predicate, str(value));

    return [...patterns.slice(0, -1), replaced];
  }

  return patterns;
}

/**
 * Build a single UNION arm for freeform search on a specific branch.
 * Includes keyword patterns + path to the branch + FILTER(regex).
 */
function freeformArm(schema, base, branch, regexPattern, kwPatterns, namespace) {
  if (branch === base) {
    // freeform on base value
    const baseVar = df.variable(`${base}_v`);
    const pat = af.createPattern(df.variable(base), iri(namespace, base), baseVar);
    const allPatterns = [...kwPatterns, pat];
    const expr = af.createOperatorExpression("regex", [
      af.createTermExpression(baseVar),
      af.createTermExpression(str(regexPattern)),
    ]);

    return af.createFilter(af.createBgp(allPatterns), expr);
  }

  // nested branch — trace path from base
  const { patterns: pp, leafVar } = pathPatterns(schema, base, branch, namespace);
  const allPatterns = [...kwPatterns, ...pp];
  const expr = af.createOperatorExpression("regex", [
    af.createTermExpression(leafVar),
    af.createTermExpression(str(regexPattern)),
  ]);

  return af.createFilter(af.createBgp(allPatterns), expr);
}

/**
 * Convert a parsed query into SPARQL SELECT algebra.
 *
 * @param {string} base - the base branch name (e.g. "mind")
 * @param {{ filters: Object<string,string>, freeform: string[] }} parsed
 * @param {string} namespace - IRI namespace (e.g. "urn:uuid:MIND-UUID")
 * @param {object} schema - schema object with trunks/leaves per branch
 * @returns {object} Traqula algebra tree
 */
export function queryToAlgebra(base, parsed, namespace, schema) {
  const subjectVar = df.variable(base);

  // build keyword filter patterns (handling nested paths)
  const kwPatterns = [];

  for (const [key, value] of Object.entries(parsed.filters)) {
    kwPatterns.push(...keywordFilterPatterns(schema, base, key, value, namespace));
  }

  let where;

  if (parsed.freeform.length > 0) {
    // TODO: AND per-word across branches (requires query intersection)
    const regexPattern = parsed.freeform.join(" ");

    // all reachable branches from base (the "crown")
    const crown = findCrown(schema, base);

    // skip branches already constrained by a keyword filter
    const searchBranches = crown.filter((b) => !(b in parsed.filters));

    const arms = searchBranches.map((branch) =>
      freeformArm(schema, base, branch, regexPattern, kwPatterns, namespace),
    );

    if (arms.length === 0) {
      where = af.createBgp(kwPatterns);
    } else if (arms.length === 1) {
      where = arms[0];
    } else {
      where = af.createUnion(arms);
    }
  } else {
    where = af.createBgp(kwPatterns);
  }

  return af.createProject(where, [subjectVar]);
}
