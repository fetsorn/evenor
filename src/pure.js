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

    const taskRaw = metaRecord.task;

    const cognateRaw = metaRecord.cognate;

    // withProse may promote leaf values to objects; extract the string
    const task =
      typeof taskRaw === "object" && taskRaw !== null
        ? taskRaw[taskRaw._]
        : taskRaw;

    const cognate =
      typeof cognateRaw === "object" && cognateRaw !== null
        ? cognateRaw[cognateRaw._]
        : cognateRaw;

    const commatEn = metaRecord["@en"];

    const commatRu = metaRecord["@ru"];

    const taskPartial = task !== undefined ? { task } : {};

    const cognatePartial = cognate !== undefined ? { cognate } : {};

    const enPartial =
      commatEn !== undefined ? { en: commatEn } : undefined;

    const ruPartial =
      commatRu !== undefined ? { ru: commatRu } : undefined;

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

  const date = schema[base].leaves
    .filter((leaf) => schema[leaf].task === "date")
    .sort()[0];

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

      const trunksRaw = Array.isArray(trunk) ? trunk : [trunk];

      // withProse may promote trunk values to objects; extract strings
      const trunks = trunksRaw.map((t) =>
        typeof t === "object" && t !== null ? t[t._] : t,
      );

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
  // e.g. name:"John Doe" stays as one token
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
        // colon present but not a known keyword => freeform
        freeform.push(token);
      }
    } else {
      freeform.push(token);
    }
  }

  return { filters, freeform };
}

/**
 * Build a URLSearchParams from parsed query + base, suitable for searchParamsToQuery.
 * @param {string} base - the base type (e.g. "mind")
 * @param {{ filters: Object, freeform: string[] }} parsed - from parseQueryString
 * @returns {URLSearchParams}
 */
export function buildSearchParams(base, parsed) {
  const params = new URLSearchParams();

  params.set("_", base);

  for (const [key, value] of Object.entries(parsed.filters)) {
    if (key !== "_") {
      params.set(key, value);
    }
  }

  // freeform: search base value with OR regex across freeform terms
  if (parsed.freeform.length > 0) {
    const freeformRegex = parsed.freeform.join("|");
    params.set(base, freeformRegex);
  }

  return params;
}
