import { findCrown, sow, sortNestingDescending } from "@fetsorn/csvs-js";

/**
 * This function is true when branch has no leaves
 * @name isTwig
 * @function
 * @param {object} schema - Dataset schema.
 * @param {object} record - An expanded record.
 * @returns {object} - A condensed record.
 */
export function isTwig(schema, branch) {
  if (!Object.hasOwn(schema, branch)) throw Error("isTwig non-existing branch");

  return schema[branch].leaves.length === 0;
}

/**
 * This returns search params from a queries object
 * @name searchParamsToQueries
 * @export function
 * @param {Object} queries - a queries object
 * @returns {URLSearchParams} urlSearchParams - search params from a query string.
 */
export function queriesToParams(queries) {
  const searchParams = new URLSearchParams();

  Object.keys(queries).map((key) =>
    queries[key] === "" ? null : searchParams.set(key, queries[key]),
  );

  return searchParams;
}

/**
 * This returns a queries object from search params
 * @name searchParamsToQueries
 * @export function
 * @param {Object} schema - dataset schema.
 * @param {URLSearchParams} searchParams - search params from a query string.
 * @returns {Object}
 */
export function searchParamsToQueries(schema, searchParams) {
  // search params is a flat key-value thing
  // schema is also flat, but it describes
  // root-leaf relationships between keys
  // queries are a nested object where each leaf is inside a root
  // the limit level of nesting is defined by the schema
  // and so ideally this function would walk the schema
  // checking if the given branch has value
  // and inserting a key to queries
  // csvs-js uses the sow function for this
  // TODO if this fails, throw
  const base = searchParams.get("_");

  // TODO if this fails, do not set
  const baseValue = searchParams.get(base);

  const entries = searchParams.entries().filter(([key, value]) => key !== "_");

  // sort so trunks come first
  const sorted = entries.sort(sortNestingDescending(schema));

  // sow each
  const queries = sorted.reduce(
    (withEntry, [key, value]) => {
      // if has no trunks, sow to root somehow
      const trunks = schema[key];

      const grain = { _: key, [key]: value };

      return sow(withEntry, grain, trunk, leaf);
    },
    { _: base },
  );

  return {};
}

// add trunk field from schema record to branch records
// turn { _: _, branch1: [ branch2 ] }, [{ _: branch, branch: "branch2", task: "date" }]
// into [{ _: branch, branch: "branch2", trunk: "branch1", task: "date" }]
export function enrichBranchRecords(schemaRecord, metaRecords) {
  // [[branch1, [branch2]]]
  const schemaRelations = Object.entries(schemaRecord).filter(
    ([key]) => key !== "_",
  );

  // list of unique branches in the schema
  const branches = [...new Set(schemaRelations.flat(Infinity))];

  const branchRecords = branches.reduce((accBranch, branch) => {
    // check each key of schemaRecord, if array has branch, push trunk to metaRecord.trunks
    const relationsPartial = schemaRelations.reduce(
      (accTrunk, [trunk, leaves]) => {
        // if old is array, [ ...old, new ]
        // if old is string, [ old, new ]
        // is old is undefined, [ new ]
        const trunkPartial = leaves.includes(branch) ? [trunk] : [];

        const leavesPartial = trunk === branch ? leaves : [];

        return {
          trunks: [...accTrunk.trunks, ...trunkPartial],
          leaves: [...accTrunk.leaves, ...leavesPartial],
        };
      },
      { trunks: [], leaves: [] },
    );

    const branchPartial = { _: "branch", branch };

    const metaPartial =
      metaRecords.find((record) => record.branch === branch) ?? {};

    // if branch has no trunks, it's a root
    if (relationsPartial.trunks.length === 0) {
      const rootRecord = { ...branchPartial, ...metaPartial };

      return [...accBranch, rootRecord];
    }

    const branchRecord = {
      ...branchPartial,
      ...metaPartial,
      ...relationsPartial,
    };

    return [...accBranch, branchRecord];
  }, []);

  return branchRecords;
}

// extract schema record with trunks from branch records
// turn [{ _: branch, branch: "branch2", trunk: "branch1", task: "date" }]
// into [{ _: _, branch1: branch2 }, { _: branch, branch: "branch2", task: "date" }]
export function extractSchemaRecords(branchRecords) {
  const records = branchRecords.reduce(
    (acc, branchRecord) => {
      const { trunk, ...branchRecordOmitted } = branchRecord;

      const accLeaves = acc.schemaRecord[trunk] ?? [];

      const schemaRecord =
        trunk !== undefined
          ? {
              ...acc.schemaRecord,
              [trunk]: [branchRecord.branch, ...accLeaves],
            }
          : acc.schemaRecord;

      const metaRecords = [branchRecordOmitted, ...acc.metaRecords];

      return { schemaRecord, metaRecords };
    },
    { schemaRecord: { _: "_" }, metaRecords: [] },
  );

  return [records.schemaRecord, ...records.metaRecords];
}

// turn
// { event: { description: { en: "", ru: "" } }, datum: { trunk: "event" } }
// into
// [ {_: "_", event: [ "datum" ]},
//   {_: branch, branch: "event", description_en: "", description_ru: ""},
//   {_: branch, branch: "datum"}
// ]
export function schemaToBranchRecords(schema) {
  const branches = Object.keys(schema);

  const records = branches.reduce(
    (acc, branch) => {
      const { leaves, task, cognate, description } = schema[branch];

      const schemaRecord =
        leaves.length > 0
          ? { ...acc.schemaRecord, [branch]: leaves }
          : acc.schemaRecord;

      const partialEn =
        description && description.en ? { description_en: description.en } : {};

      const partialRu =
        description && description.ru ? { description_ru: description.ru } : {};

      const partialTask = task ? { task } : {};

      const partialCognate = cognate ? { cognate } : {};

      const metaRecords = [
        {
          _: "branch",
          branch,
          ...partialTask,
          ...partialCognate,
          ...partialEn,
          ...partialRu,
        },
        ...acc.metaRecords,
      ];

      return { schemaRecord, metaRecords };
    },
    { schemaRecord: { _: "_" }, metaRecords: [] },
  );

  return [records.schemaRecord, ...records.metaRecords];
}

// turn
// { _: "_", event: [ "datum" ] },
// [ { _: branch, branch: "event", description_en: "", description_ru: "" },
//   { _: branch, branch: "datum" }
// ]
// into
// { event: { description: { en: "", ru: "" } }, datum: { trunk: "event" } }
export function recordsToSchema(schemaRecord, metaRecords) {
  // [[branch1, [branch2]]]
  const schemaRelations = Object.entries(schemaRecord).filter(
    ([key]) => key !== "_",
  );

  // list of unique branches in the schema
  const branches = [...new Set(schemaRelations.flat(Infinity))];

  const schema = branches.reduce((accBranch, branch) => {
    const relationsPartial = schemaRelations.reduce(
      (accTrunk, [trunk, leaves]) => {
        // if old is array, [ ...old, new ]
        // if old is string, [ old, new ]
        // is old is undefined, [ new ]
        const trunkPartial = leaves.includes(branch) ? [trunk] : [];

        const leavesPartial = trunk === branch ? leaves : [];

        return {
          trunks: [...accTrunk.trunks, ...trunkPartial],
          leaves: [...accTrunk.leaves, ...leavesPartial],
        };
      },
      { trunks: [], leaves: [] },
    );

    const metaRecord =
      metaRecords.find((record) => record.branch === branch) ?? {};

    const { task, cognate, description_en, description_ru } = metaRecord;

    const taskPartial = task !== undefined ? { task } : {};

    const cognatePartial = cognate !== undefined ? { cognate } : {};

    const enPartial =
      description_en !== undefined ? { en: description_en } : undefined;

    const ruPartial =
      description_ru !== undefined ? { ru: description_ru } : undefined;

    const descriptionPartial =
      enPartial || ruPartial
        ? { description: { ...enPartial, ...ruPartial } }
        : {};

    const branchPartial = {
      [branch]: {
        ...relationsPartial,
        ...taskPartial,
        ...cognatePartial,
        ...descriptionPartial,
      },
    };

    return { ...accBranch, ...branchPartial };
  }, {});

  return schema;
}
