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
 * This picks default base from a root branch of schema
 * @name getDefaultBase
 * @function
 * @param {object} schema -
 * @returns {String}
 */
export function pickDefaultBase(schema) {
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

  const date = schema[base].leaves.filter((leaf) => schema[leaf].task === "date").sort()[0];

  const sortBy = date ?? base;

  return sortBy;
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
