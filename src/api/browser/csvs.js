import csvs from "@fetsorn/csvs-js";
import { fs } from "@/api/browser/lightningfs.js";
import { findMind } from "@/api/browser/io.js";

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

  return records;
}

/**
 * This
 * @name selectStream
 * @function
 * @param {String} mind -
 * @param {object} query -
 * @returns {object}
 */
export async function selectStream(mind, query) {
  const dir = await findMind(mind);

  // TODO terminate previous stream
  const selectStream = csvs.selectRecordStream({
    fs,
    dir,
  });

  const queryStream = new ReadableStream({
    start(controller) {
      controller.enqueue(query);

      controller.close();
    },
  });

  const strm = queryStream.pipeThrough(selectStream);

  // let closeHandler = () => strm.cancel();
  let closeHandler = () => {};

  return { strm, closeHandler };
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
