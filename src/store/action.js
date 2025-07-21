import { updateRecord, selectStream } from "@/store/impure.js";
import { createRoot, deleteRecord } from "@/store/record.js";
import {
  changeSearchParams,
  makeURL,
  pickDefaultBase,
  pickDefaultSortBy,
} from "@/store/pure.js";
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

  const { mind, schema } = searchParams.has("~")
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
    mind,
    schema,
    searchParams,
  };
}

/**
 * This
 * @name search
 * @function
 * @param {object} schema -
 * @param {SearchParams} searchParams -
 * @param {object} mind -
 * @param {String} name -
 * @param {String} field -
 * @param {String} value -
 * @param {Function} appendRecord -
 * @returns {object}
 */
export async function search(
  schema,
  searchParams,
  mind,
  name,
  field,
  value,
  appendRecord,
) {
  // update searchParams
  const searchParamsNew = changeSearchParams(searchParams, field, value);

  const url = makeURL(searchParamsNew, value, mind, name);

  window.history.replaceState(null, null, url);

  if (field.startsWith("."))
    return {
      searchParams: searchParamsNew,
      abortPreviousStream: () => {},
      startStream: () => {},
    };

  const { abortPreviousStream, startStream } = await selectStream(
    schema,
    mind,
    appendRecord,
    searchParamsNew,
  );

  return { searchParams: searchParamsNew, abortPreviousStream, startStream };
}
