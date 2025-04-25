import { sow, mow, sortNestingDescending } from "@fetsorn/csvs-js";

/**
 * This returns a query string from a csvs query
 * @name queryToSearchParams
 * @export function
 * @param {Object} query - a csvs query object
 * @returns {URLSearchParams} urlSearchParams - search params from a query string.
 */
export function queryToSearchParams(query) {
  if (!Object.hasOwn(query, "_")) throw Error("no base in query");

  const searchParams = Object.entries(query).reduce(
    (withField, [key, value]) => {
      const params =
        typeof value === "object"
          ? queryToSearchParams(value)
          : new URLSearchParams(`${key}=${value}`);

      return new URLSearchParams([...withField, ...params]);
    },
    new URLSearchParams(),
  );

  searchParams.set("_", query._);

  searchParams.sort();

  return searchParams;
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
 * This returns a csvs query from a query string
 * @name searchParamsToQuery
 * @export function
 * @param {Object} schema - dataset schema.
 * @param {URLSearchParams} searchParams - search params from a query string.
 * @returns {Object}
 */
export function searchParamsToQuery(schema, searchParams) {
  // search params is a flat key-value thing
  // schema is also flat, but it describes
  // root-leaf relationships between keys
  // query is a nested object where each leaf is inside a root
  // the limit level of nesting is defined by the schema
  // walk the schema checking if a given branch has value
  // and insert the key to query with sow

  const base = searchParams.get("_");

  if (base === null) throw Error("no base in query");

  const baseValue = searchParams.get(base);

  const baseQuery =
    baseValue === null ? { _: base } : { _: base, [base]: baseValue };

  const entries = Array.from(searchParams.entries()).filter(
    ([key]) => key !== "_",
  );

  // sort so that trunks come first
  const sorted = entries.toSorted(([a], [b]) =>
    sortNestingDescending(schema)(a, b),
  );

  const query = sorted.reduce((withEntry, [leaf, value]) => {
    const { trunks } = schema[leaf];

    const sown = trunks.reduce((withTrunk, trunk) => {
      // check that value is nested and enrich object
      // if the entry does not have trunk yet in sow, sow it.
      // all trunk values were already sowed
      // because the entries are sorted in ascending order
      // so if this still does not have a trunk, sow the trunk
      // and the trunk of the trunk recursively until root
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

  return query;
}

// add trunk field from schema record to branch records
export function enrichBranchRecords(schemaRecord, metaRecords) {
  // [[branch1, [branch2]]]
  const schemaRelations = Object.entries(schemaRecord).filter(
    ([key]) => key !== "_",
  );

  // list of unique branches in the schema
  const branches = [...new Set(schemaRelations.flat(Infinity))];

  const branchRecords = branches.reduce((withBranch, branch) => {
    // check each key of schemaRecord, if array has branch, push trunk to metaRecord.trunks
    const relationsPartial = schemaRelations.reduce(
      (withTrunk, [trunk, leaves]) => {
        // if old is array, [ ...old, new ]
        // if old is string, [ old, new ]
        // is old is undefined, [ new ]
        const trunkPartial = leaves.includes(branch) ? [trunk] : [];

        const leavesPartial = trunk === branch ? leaves : [];

        return {
          trunks: [...withTrunk.trunks, ...trunkPartial],
          leaves: [...withTrunk.leaves, ...leavesPartial],
        };
      },
      { trunks: [], leaves: [] },
    );

    const branchPartial = { _: "branch", branch };

    const metaPartial =
      metaRecords.find((record) => record.branch === branch) ?? {};

    // if branch has no trunks, it's a root
    if (relationsPartial.trunks.length === 0) {
      const rootRecord = {
        ...branchPartial,
        ...metaPartial,
        ...relationsPartial,
      };

      return [...withBranch, rootRecord];
    }

    const branchRecord = {
      ...branchPartial,
      ...metaPartial,
      ...relationsPartial,
    };

    return [...withBranch, branchRecord];
  }, []);

  return branchRecords;
}

// extract schema record with trunks from branch records
export function extractSchemaRecords(branchRecords) {
  const records = branchRecords.reduce(
    (withBranch, branchRecord) => {
      const { trunks, leaves: omit, ...branchRecordOmitted } = branchRecord;

      const schemaRecord = trunks.reduce((withTrunk, trunk) => {
        const leaves = withBranch.schemaRecord[trunk] ?? [];

        const schemaRecord = {
          ...withBranch.schemaRecord,
          [trunk]: [...new Set([branchRecord.branch, ...leaves])],
        };

        return schemaRecord;
      }, withBranch.schemaRecord);

      const metaRecords = [branchRecordOmitted, ...withBranch.metaRecords];

      return { schemaRecord, metaRecords };
    },
    { schemaRecord: { _: "_" }, metaRecords: [] },
  );

  return [records.schemaRecord, ...records.metaRecords];
}

// convert schema to schema record and branch records
export function schemaToBranchRecords(schema) {
  const records = Object.entries(schema).reduce(
    (withEntry, [branch, { leaves, task, cognate, description }]) => {
      const leavesPartial = withEntry.schemaRecord[branch] ?? [];

      const schemaRecord =
        leaves.length > 0
          ? {
              ...withEntry.schemaRecord,
              [branch]: [...new Set([...leaves, ...leavesPartial])],
            }
          : withEntry.schemaRecord;

      const partialEn =
        description && description.en !== undefined
          ? { description_en: description.en }
          : {};

      const partialRu =
        description && description.ru !== undefined
          ? { description_ru: description.ru }
          : {};

      const partialTask = task ? { task } : {};

      const partialCognate = cognate ? { cognate } : {};

      const metaRecords = [
        ...withEntry.metaRecords,
        {
          _: "branch",
          branch,
          ...partialTask,
          ...partialCognate,
          ...partialEn,
          ...partialRu,
        },
      ];

      return { schemaRecord, metaRecords };
    },
    { schemaRecord: { _: "_" }, metaRecords: [] },
  );

  return [records.schemaRecord, ...records.metaRecords];
}

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

export function changeSearchParams(searchParams, field, value) {
  // if query field is undefined, delete searchParams
  if (field === undefined) {
    return new URLSearchParams();
  } else if (field === "_") {
    // if query field is base, update default sort by
    // TODO pick default sortBy from task === "date"
    const sortBy = value;

    return new URLSearchParams(`_=${value}&.sortBy=${sortBy}`);
  } else if (field !== "") {
    // if query field is defined, update searchParams
    if (value === undefined) {
      // if query value is undefined, remove query field
      searchParams.delete(field);

      return searchParams;
    } else {
      // if query value is defined, set query field
      searchParams.set(field, value);

      return searchParams;
    }
  }

  return searchParams;
}

export function makeURL(searchParams, sortBy, repoUUID, reponame) {
  if (sortBy) {
    searchParams.set(".sortBy", sortBy);
  }

  const pathname = repoUUID === "root" ? "#" : `#/${reponame}`;

  const queryString = searchParams.toString();

  const url = `${pathname}?${queryString}`;

  return url;
}

// pick default base from a root branch of schema
export function pickDefaultBase(schema) {
  if (Object.keys(schema) === 0) throw Error("schema empty");

  const [root] = Object.entries(schema).find(
    ([, { trunks }]) => trunks.length === 0,
  );

  const base = root ?? Object.keys(schema)[0];

  return base;
}

// pick default sortBy from task === "date" of schema
export function pickDefaultSortBy(schema, base) {
  if (!Object.hasOwn(schema, base)) throw Error("schema does not have base");

  const date = schema[base].leaves.find((leaf) => schema[leaf].task === "date");

  const sortBy = date ?? base;

  return sortBy;
}

// find first available string value for sorting
export function findFirstSortBy(branch, value) {
  // if array, take first item
  const car = Array.isArray(value) ? value[0] : value;

  // it object, take base field
  const key = typeof car === "object" ? car[branch] : car;

  // if undefined, return empty string
  const id = key === undefined ? "" : key;

  return id;
}
