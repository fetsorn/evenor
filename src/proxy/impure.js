import {
  saveMindRecord,
  loadMindRecord,
  updateMind,
  updateEntry,
} from "@/proxy/record.js";

/**
 * This
 * @name updateRecord
 * @function
 * @param {object} mind -
 * @param {String} base -
 * @param {object} recordNew -
 */
export async function updateRecord(api, mind, recordNew) {
  const isHomeScreen = mind === "root";

  const isMindBranch = recordNew._ === "mind";

  const canSaveMind = isHomeScreen && isMindBranch;

  if (canSaveMind) {
    await saveMindRecord(api, recordNew);
  } else {
    await updateEntry(api, mind, recordNew);
  }
}

export async function buildRecord(api, mind, record) {
  const fetched = await api.buildRecord(mind, record);

  const isHomeScreen = mind === "root";

  const recordNew = isHomeScreen ? await loadMindRecord(api, fetched) : fetched;

  return recordNew;
}
