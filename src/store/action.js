import { updateRecord } from "@/store/impure.js";
import { createRoot, deleteRecord } from "@/store/record.js";
import { pickDefaultBase, pickDefaultSortBy } from "@/store/pure.js";
import { find, clone } from "@/store/open.js";

/**
 * This
 * @name saveRecord
 * @function
 * @param {String} mind -
 * @param {String} base -
 * @param {object[]} records -
 * @param {object} recordOld -
 * @param {object} recordNew -
 * @returns {object[]}
 */
export async function saveRecord(mind, base, records, recordOld, recordNew) {
  // if no root here try to create
  await createRoot();

  await updateRecord(mind, base, recordNew);

  const recordsNew = records
    .filter((r) => r[base] !== recordOld[base])
    .concat([recordNew]);

  return recordsNew;
}

/**
 * This
 * @name wipeRecord
 * @function
 * @param {object} mind -
 * @param {String} base -
 * @param {object[]} records -
 * @param {object} record -
 * @returns {object[]}
 */
export async function wipeRecord(mind, base, records, record) {
  await deleteRecord(mind, record);

  const recordsNew = records.filter((r) => r[base] !== record[base]);

  return recordsNew;
}

/**
 * This
 * @name changeMind
 * @function
 * @param {String} pathname -
 * @param {String} searchString -
 * @returns {object}
 */
export async function changeMind(pathname, searchString) {
  const mind = pathname === "/" ? "root" : pathname.replace("/", "");

  const searchParams = new URLSearchParams(searchString);

  const remoteUrl = searchParams.get("~");

  const token = searchParams.get("-") ?? "";

  const { mind: mindRecord, schema } = searchParams.has("~")
    ? await clone(undefined, undefined, remoteUrl, token)
    : await find(mind, undefined);

  if (!searchParams.has("_")) {
    searchParams.set("_", pickDefaultBase(schema));
  }

  if (!searchParams.has(".sortBy")) {
    searchParams.set(
      ".sortBy",
      pickDefaultSortBy(schema, searchParams.get("_")),
    );
  }

  return {
    mind: mindRecord,
    schema,
    searchParams,
  };
}
