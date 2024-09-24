import {
  findCrown,
  enrichBranchRecords,
  extractSchemaRecords,
} from "@fetsorn/csvs-js";
import { API, recordsToSchema } from "../api/index.js";

export function getDefaultBase(schema) {
  // find a sane default branch to select
  const base = Object.keys(schema).find((branch) => {
    // does not have a trunk
    const isRoot = !Object.hasOwn(schema[branch], "trunk");

    // not the metadata schema branch
    const isData = branch !== "branch";

    return isRoot && isData;
  });

  return base;
}

// pick a param to group data by
export function getDefaultSortBy(schema, base, records) {
  // TODO rewrite to const and tertials
  let sortBy;

  const crown = findCrown(schema, base);

  const record = records[0] ?? {};

  // fallback to first date param present in data
  sortBy = crown.find(
    (branch) => schema[branch].task === "date" && Object.hasOwn(record, branch),
  );

  // fallback to first param present in data
  if (!sortBy) {
    sortBy = crown.find((branch) => Object.hasOwn(record, branch));
  }

  // fallback to first date param present in schema
  if (!sortBy) {
    sortBy = crown.find((branch) => schema[branch].task === "date");
  }

  // fallback to first param present in schema
  if (!sortBy) {
    [sortBy] = crown;
  }

  // unreachable with a valid scheme
  if (!sortBy) {
    return base;
    // throw Error("failed to find default sortBy in the schema");
  }

  return sortBy;
}

async function readRemotes(api) {
  try {
    const remotes = await api.listRemotes();

    const remoteTags = await Promise.all(
      remotes.map(async (remoteName) => {
        const [remoteUrl, remoteToken] = await api.getRemote(remoteName);

        const partialToken = remoteToken ? { remote_token: remoteToken } : {};

        return {
          _: "remote_tag",
          remote_name: remoteName,
          remote_url: remoteUrl,
          ...partialToken,
        };
      }),
    );

    return { remote_tag: remoteTags };
  } catch {
    return {};
  }
}

async function readLocals(api) {
  try {
    const locals = await api.listAssetPaths();

    return locals.reduce(
      (acc, local) => {
        const tagsLocalOld = acc.local_tag;

        return { ...acc, remote_tag: [...tagsLocalOld, local] };
      },
      { local_tag: [] },
    );
  } catch {
    return {};
  }
}

// load git state and schema from folder into the record
export async function loadRepoRecord(record) {
  const repoUUID = record.repo;

  const api = new API(repoUUID);

  const [schemaRecord] = await api.select(new URLSearchParams("?_=_"));

  // query {_:branch}
  const metaRecords = await api.select(new URLSearchParams("?_=branch"));

  // add trunk field from schema record to branch records
  const branchRecords = enrichBranchRecords(schemaRecord, metaRecords);

  const branchPartial = { branch: branchRecords };

  // get remote
  const tagsRemotePartial = await readRemotes(api);

  // get locals
  const tagsLocalPartial = await readLocals(api);

  const recordNew = {
    ...record,
    ...branchPartial,
    ...tagsRemotePartial,
    ...tagsLocalPartial,
  };

  return recordNew;
}

async function writeRemotes(api, tags) {
  if (tags) {
    const tagsList = Array.isArray(tags) ? tags : [tags];

    for (const tag of tagsList) {
      try {
        await api.addRemote(
          tag.remote_tag,
          tag.remote_url[0],
          tag.remote_token,
        );
      } catch (e) {
        console.log(e);
        // do nothing
      }
    }
  }
}

async function writeLocals(api, tags) {
  if (tags) {
    const tagList = Array.isArray(tags) ? tags : [tags];

    for (const tag of tagList) {
      try {
        api.addAssetPath(tag);
      } catch {
        // do nothing
      }
    }
  }
}

// clone or populate repo, write git state
export async function saveRepoRecord(record) {
  const repoUUID = record.repo;

  const api = new API(repoUUID);

  // extract schema record with trunks from branch records
  const [schemaRecord, ...metaRecords] = extractSchemaRecords(record.branch);

  const schema = recordsToSchema(schemaRecord, metaRecords);

  // create repo directory with a schema
  await api.ensure(record.reponame);

  await api.updateRecord(schemaRecord);

  for (const metaRecord of metaRecords) {
    await api.updateRecord(metaRecord);
  }

  // write remotes to .git/config
  await writeRemotes(api, record.remote_tag);

  // write locals to .git/config
  await writeLocals(api, record.local_tag);

  await api.commit();

  return;
}

function queriesToParams(queriesObject) {
  const searchParams = new URLSearchParams();

  Object.keys(queriesObject).map((key) =>
    queriesObject[key] === ""
      ? null
      : searchParams.set(key, queriesObject[key]),
  );

  return searchParams;
}

export function setURL(queries, base, sortBy, repoUUID, reponame) {
  const searchParams = queriesToParams(queries);

  searchParams.set("_", base);

  if (sortBy) {
    searchParams.set(".sortBy", sortBy);
  }

  const pathname = repoUUID === "root" ? "#" : `#/${reponame}`;

  const searchStringNew = searchParams.toString();

  const urlNew = `${pathname}?${searchStringNew}`;

  window.history.replaceState(null, null, urlNew);

  return searchParams;
}

/**
 * This generates a UUID.
 * @name randomUUIDPolyfill
 * @function
 * @returns {string} - UUID compliant with RFC 4122.
 */
export async function randomUUID() {
  if (typeof window === "undefined") {
    const crypto = await import("crypto");

    return crypto.randomUUID();
  }
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16),
  );
}

/**
 * This generates a SHA-256 hashsum.
 * @name digestMessage
 * @function
 * @param {string} message - A string.
 * @returns {string} - SHA-256 hashsum.
 */
export async function digestMessage(message) {
  // hash as buffer
  // const hashBuffer = await digest(message);

  let hashBuffer;

  if (typeof window === "undefined") {
    const crypto = await import("crypto");

    // hashBuffer = crypto.createHash('sha256').update(message, 'utf8').digest();
    hashBuffer = await crypto.webcrypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(message),
    );
  } else {
    hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(message),
    );
  }

  // convert buffer to byte array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}
