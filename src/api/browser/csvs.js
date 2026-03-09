import csvs from "@fetsorn/csvs-js";
import { fs } from "@/api/browser/lightningfs.js";
import { findMind } from "@/api/browser/io.js";

let selectMap = {};

/**
 * This
 * @name select
 * @function
 * @param {String} mind -
 * @param {object} query -
 * @returns {Object[]}
 */
export async function select(mind, query) {
  const dir = await findMind(mind);

  const records = await csvs.selectRecord({
    fs,
    dir,
    query,
  });

  return records ?? [];
}

export async function buildRecord(mind, record) {
  const dir = await findMind(mind);

  return csvs.buildRecord({ fs, dir, query: [record] });
}

/**
 * This
 * @name selectStream
 * @function
 * @param {String} mind -
 * @param {object} query -
 * @returns {object}
 */
export async function selectStream(mind, streamid, query) {
  const dir = await findMind(mind);

  // if not started, start the pull stream
  if (selectMap[streamid] === undefined) {
    const selectStream = await csvs.selectRecordStreamPull({
      fs,
      dir,
      query,
      light: true,
    });

    selectMap[streamid] = selectStream[Symbol.asyncIterator]();
  }

  // if started, return a window of results
  const { done, value } = await selectMap[streamid].next();

  // if stream ended, return done: true
  if (done) {
    selectMap[streamid] = undefined;

    return { done: true };
  }

  return { done, value };
}

/**
 * This
 * @name updateRecord
 * @function
 * @param {String} mind -
 * @param {object} record -
 */
export async function updateRecord(mind, record) {
  const dir = await findMind(mind);

  await csvs.updateRecord({
    fs,
    dir,
    query: record,
  });
}

/**
 * This
 * @name deleteRecord
 * @function
 * @param {String} mind -
 * @param {object} record -
 */
export async function deleteRecord(mind, record) {
  const dir = await findMind(mind);

  await csvs.deleteRecord({
    fs,
    dir,
    query: record,
  });
}
