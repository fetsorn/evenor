import { sow, mow, sortNestingDescending } from "@fetsorn/csvs-js";

/**
 * This returns a query string from a csvs query
 * @name queryToSearchParams
 * @export function
 * @param {Object} query - a csvs query object
 * @returns {URLSearchParams} urlSearchParams - search params from a query string.
 */
export function queryToSearchParams(query) {
  if (!query.hasOwnProperty("_")) throw Error("no base in query");

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

/**
 * This makes sure record has trunk and all trunks of trunk until root
 * @name ensureTrunk
 * @function
 * @param {object} schema -
 * @param {object} record -
 * @param {String} trunk -
 * @param {String} leaf -
 * @returns {object}
 */
export function ensureTrunk(schema, record, trunk, leaf) {
  if (!record.hasOwnProperty("_")) throw Error("record has no base");

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
 * @param {Object} schema - mind schema.
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
    ([key]) => key !== "_" && key !== "~" && key !== "-",
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

/**
 * This adds trunk field from schema record to branch records
 * @name enrichBranchRecords
 * @function
 * @param {object} schemaRecord -
 * @param {object[]} metaRecords -
 * @returns {object[]}
 */
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
          trunk: [...withTrunk.trunk, ...trunkPartial],
          leaf: [...withTrunk.leaf, ...leavesPartial],
        };
      },
      { trunk: [], leaf: [] },
    );

    const branchPartial = { _: "branch", branch };

    const metaPartial =
      metaRecords.find((record) => record.branch === branch) ?? {};

    // if branch has no trunks, it's a root
    if (relationsPartial.trunk.length === 0) {
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

/**
 * This extracts schema record with trunks from branch records
 * @name extractSchemaRecords
 * @function
 * @param {object} branchRecords -
 * @returns {object[]}
 */
export function extractSchemaRecords(branchRecords) {
  const records = branchRecords.reduce(
    (withBranch, branchRecord) => {
      const { trunk, leaf: omit, ...branchRecordOmitted } = branchRecord;

      const trunks = Array.isArray(trunk) ? trunk : [trunk];

      const schemaRecord = trunks
        .filter((t) => t !== undefined)
        .reduce((withTrunk, trunk) => {
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

/**
 * This converts schema to schema record and branch records
 * @name schemaToBranchRecords
 * @function
 * @param {object} schema -
 * @returns {object}
 */
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

/**
 * This
 * @name recordsToSchema
 * @function
 * @param {object} schemaRecord -
 * @param {object[]} metaRecords -
 * @returns {object}
 */
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
        const leavesArray = Array.isArray(leaves) ? leaves : [leaves];
        // if old is array, [ ...old, new ]
        // if old is string, [ old, new ]
        // is old is undefined, [ new ]
        const trunkPartial = leavesArray.includes(branch) ? [trunk] : [];

        const leavesPartial = trunk === branch ? leavesArray : [];

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

/**
 * This
 * @name changeSearchParams
 * @function
 * @param {SearchParams} searchParams -
 * @param {String} field -
 * @param {String} value -
 * @returns {SearchParams}
 */
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

/**
 * This
 * @name makeURL
 * @function
 * @param {SearchParams} searchParams -
 * @param {String} mind -
 * @returns {String}
 */
export function makeURL(searchParams, mind) {
  const pathname = mind === "root" ? "#" : `#/${mind}`;

  const queryString = searchParams.toString();

  const url = `${pathname}?${queryString}`;

  return url;
}

/**
 * This picks default base from a root branch of schema
 * @name getDefaultBase
 * @function
 * @param {object} schema -
 * @returns {String}
 */
export function getDefaultBase(schema) {
  if (Object.keys(schema) === 0) throw Error("schema empty");

  // return some branch of schema
  const roots = Object.keys(schema).filter(
    (b) => b !== "branch" && schema[b].trunks.length == 0,
  );

  const base = roots.reduce((withRoot, root) => {
    if (schema[root].leaves.length > schema[withRoot].leaves.length) {
      return root;
    } else {
      return withRoot;
    }
  }, roots[0]);

  return base;
}

/**
 * This picks default sortBy from task === "date" of schema
 * @name pickDefaultSortBy
 * @function
 * @param {object} schema -
 * @param {String} base -
 * @returns {String}
 */
export function pickDefaultSortBy(schema, base) {
  if (!schema.hasOwnProperty(base)) throw Error("schema does not have base");

  const date = schema[base].leaves.find((leaf) => schema[leaf].task === "date");

  const sortBy = date ?? base;

  return sortBy;
}

/**
 * This finds first available string value for sorting
 * @name findFirstSortBy
 * @function
 * @param {object} branch -
 * @param {String} value -
 * @returns {String}
 */
export function findFirstSortBy(branch, value) {
  // if array, take first item
  const car = Array.isArray(value) ? value[0] : value;

  // it object, take base field
  const key = typeof car === "object" ? car[branch] : car;

  // if undefined, return empty string
  const sortBy = key === undefined ? "" : key;

  return sortBy;
}

export function sortCallback(sortBy, sortDirection) {
  return (a, b) => {
    const valueA = findFirstSortBy(sortBy, a[sortBy]);

    const valueB = findFirstSortBy(sortBy, b[sortBy]);

    switch (sortDirection) {
      case "first":
        return valueA.localeCompare(valueB);
      case "last":
        return valueB.localeCompare(valueA);
      default:
        return valueA.localeCompare(valueB);
    }
  };
}
