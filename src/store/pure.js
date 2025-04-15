import { findCrown, sow, mow, sortNestingDescending } from "@fetsorn/csvs-js";

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
 * @name queryToQueryString
 * @export function
 * @param {Object} queries - a queries object
 * @returns {URLSearchParams} urlSearchParams - search params from a query string.
 */
export function queryToQueryString(query) {
  if (!Object.hasOwn(query, "_")) throw Error("no base in query");

  const searchParams = Object.entries(query).reduce(
    (withField, [key, value]) => {
      const queryString =
        typeof value === "object"
          ? queryToQueryString(value)
          : `${key}=${value}`;

      const params = new URLSearchParams(queryString);

      return new URLSearchParams([...withField, ...params]);
    },
    new URLSearchParams(),
  );

  searchParams.set("_", query._);

  searchParams.sort();

  const queryString = searchParams.toString();

  return queryString;
}

// make sure record has trunk and all trunks of trunk until root
export function ensureTrunk(schema, record, trunk, leaf) {
  if (!Object.hasOwn(record, "_")) throw Error("record has no base");

  // if query has branch, return query
  const hasTrunk = mow(record, trunk, leaf).length > 0;

  if (hasTrunk) return record;

  // mains are trunks of trunk
  const { trunks: mains } = schema[trunk];

  // if this reaches root return query
  if (mains === undefined) return record;

  // for each main
  // ensure record has main, and sow trunk
  const withMains = mains.reduce((withMain, main) => {
    const ensured = ensureTrunk(schema, withMain, main, trunk);

    const mainValues = mow(ensured, main, trunk).map((grain) => grain[main]);

    const withMainValues = mainValues.reduce((withMainValue, mainValue) => {
      const grain = { _: main, [main]: mainValue, [trunk]: { _: trunk } };

      // now that query has trunk, sow trait
      const sown = sow(withMainValue, grain, main, trunk);

      return sown;
    }, ensured);

    return withMainValues;
  }, record);

  return withMains;
}

/**
 * This returns a queries object from search params
 * @name queryStringToQuery
 * @export function
 * @param {Object} schema - dataset schema.
 * @param {URLSearchParams} searchParams - search params from a query string.
 * @returns {Object}
 */
export function queryStringToQuery(schema, queryString) {
  const searchParams = new URLSearchParams(queryString);

  // search params is a flat key-value thing
  // schema is also flat, but it describes
  // root-leaf relationships between keys
  // queries are a nested object where each leaf is inside a root
  // the limit level of nesting is defined by the schema
  // walk the schema checking if a given branch has value
  // and insert the key to queries with sow

  const base = searchParams.get("_");

  if (base === null) throw Error("no base in query");

  const baseValue = searchParams.get(base);

  const baseQuery =
    baseValue === null ? { _: base } : { _: base, [base]: baseValue };

  const entries = Array.from(searchParams.entries()).filter(
    ([key, value]) => key !== "_",
  );

  // sort so that trunks come first
  const sorted = entries.toSorted(([a], [b]) =>
    sortNestingDescending(schema)(a, b),
  );

  const queries = sorted.reduce((withEntry, [leaf, value]) => {
    const { trunks } = schema[leaf];

    // check that value is nested and enrich object
    // if the entry does not have trunk yet in sow, sow it.
    // all values from trunk queries were already sowed
    // because the entries are sorted in ascending order
    // so if this still does not have a trunk, sow the trunk
    // and the trunk of the trunk recursive until root
    const sown = trunks.reduce((withTrunk, trunk) => {
      const withTrunkOfLeaf = ensureTrunk(schema, withTrunk, trunk, leaf);

      const trunkValues = mow(withTrunkOfLeaf, trunk, leaf).map(
        (grain) => grain[trunk],
      );

      const withLeaf = trunkValues.reduce((withTrunkValue, trunkValue) => {
        const grain = { _: trunk, [trunk]: trunkValue, [leaf]: value };

        const withGrain = sow(withTrunkValue, grain, trunk, leaf);

        return withGrain;
      }, withTrunkOfLeaf);

      return withLeaf;
    }, withEntry);

    return sown;
  }, baseQuery);

  return queries;
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
