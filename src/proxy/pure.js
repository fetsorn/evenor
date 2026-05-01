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

export async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
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
