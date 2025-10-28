import api from "@/api/index.js";
import { enrichBranchRecords, schemaToBranchRecords } from "@/store/pure.js";
import {
  newUUID,
  readSchema,
  updateMind,
  saveMindRecord,
} from "@/store/record.js";
import schemaRoot from "@/store/default_root_schema.json";

/**
 * This
 * @name find
 * @function
 * @param {String} mind -
 * @param {String} name -
 * @returns {object}
 */
export async function find(mind, name) {
  if (mind === "root")
    return {
      mind: { _: "mind", mind: "root", name: "minds" },
      schema: schemaRoot,
    };

  const mindPartial = mind !== undefined ? { mind: mind } : {};

  const namePartial = name !== undefined ? { name } : {};

  const query = {
    _: "mind",
    ...mindPartial,
    ...namePartial,
  };

  // find mind in root folder
  const [mindRecord] = await api.select("root", query);

  if (mindRecord === undefined) throw Error("where is my mind");

  const schema = await readSchema(mindRecord.mind);

  return { mind: mindRecord, schema };
}

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}

async function findMind(mind) {
  const query = {
    _: "mind",
    mind,
  };

  // find mind in root folder
  const mindRecords = await api.select("root", query);

  return mindRecords !== undefined && mindRecords.length > 0;
}

/**
 * This
 * @name clone
 * @function
 * @param {String} mind -
 * @param {String} name -
 * @param {String} url -
 * @param {String} token -
 * @returns {object}
 */
export async function clone(url, token) {
  // if uri specifies a remote
  // try to clone remote
  // where mind string is a digest of remote
  // and mind name is uri-encoded remote
  const mindRemote = await digestMessage(url);

  await api.clone(mindRemote, { url, token });

  // TODO validate and sanitize cloned dataset, get uuid

  const pathname = new URL(url).pathname;

  // get mind name from remote
  const nameClone = pathname.substring(pathname.lastIndexOf("/") + 1);

  const schemaClone = await readSchema(mindRemote);

  const [schemaRecordClone, ...metaRecordsClone] =
    schemaToBranchRecords(schemaClone);

  const branchRecordsClone = enrichBranchRecords(
    schemaRecordClone,
    metaRecordsClone,
  );

  // if repo has no uuid, create new mind
  const mind = await newUUID();

  // search root for mind
  const mindExists = await findMind(mind);

  const recordClone = {
    _: "mind",
    mind: mind,
    name: nameClone,
    branch: branchRecordsClone,
    origin_url: {
      _: "origin_url",
      origin_url: url,
      origin_token: token,
    },
  };

  // if there is no such mind
  if (mindExists === false) {
    // clone mindRemote to mind and write to root
    await api.rename(mindRemote, mind);

    await updateMind(recordClone);

    await saveMindRecord(recordClone);
  } else {
    // TODO if there is such remote, do nothing
    // TODO if this is a new remote, ask user
    // TODO if user rejects, do nothing
    // TODO if user approves write new remote to mind
  }

  // TODO remove mindRemote

  return { schema: schemaClone, mind: recordClone };
}
