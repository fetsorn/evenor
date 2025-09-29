import api from "@/api/index.js";
import { enrichBranchRecords, schemaToBranchRecords } from "@/store/pure.js";
import { readSchema, createRoot } from "@/store/record.js";
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
export async function clone(mind, name, url, token) {
  // if no root here try to create
  await createRoot();

  // if uri specifies a remote
  // try to clone remote
  // where mind string is a digest of remote
  // and mind name is uri-encoded remote
  const mindRemote = mind ?? (await digestMessage(url));

  await api.clone(mindRemote, name, { url, token });

  const pathname = new URL(url).pathname;

  // get mind name from remote
  const nameClone = name ?? pathname.substring(pathname.lastIndexOf("/") + 1);

  const schemaClone = await readSchema(mindRemote);

  const [schemaRecordClone, ...metaRecordsClone] =
    schemaToBranchRecords(schemaClone);

  const branchRecordsClone = enrichBranchRecords(
    schemaRecordClone,
    metaRecordsClone,
  );

  const recordClone = {
    _: "mind",
    mind: mindRemote,
    name: nameClone,
    branch: branchRecordsClone,
    origin_url: {
      _: "origin_url",
      origin_url: url,
      origin_token: token,
    },
  };

  return { schema: schemaClone, mind: recordClone };
}
