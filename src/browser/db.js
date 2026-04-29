import csvs from "@fetsorn/csvs-js";

export function initDB(fs, io) {
  async function csvsinit(mind) {
    const dir = await io.findMind(mind);

    await csvs.init({ fs, dir });
  }

  async function select(mind, query) {
    const dir = await io.findMind(mind);

    const records = await csvs.selectRecord({
      fs,
      dir,
      query,
    });

    return records ?? [];
  }

  async function buildRecord(mind, record) {
    const dir = await io.findMind(mind);

    return csvs.buildRecord({ fs, dir, query: [record] });
  }

  let selectMap = {};

  async function selectStream(mind, streamid, query) {
    const dir = await io.findMind(mind);

    // if not started, start the pull stream
    if (selectMap[streamid] === undefined) {
      const stream = await csvs.selectRecordStreamPull({
        fs,
        dir,
        query,
        light: true,
      });

      selectMap[streamid] = stream[Symbol.asyncIterator]();
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

  async function updateRecord(mind, record) {
    const dir = await io.findMind(mind);

    await csvs.updateRecord({
      fs,
      dir,
      query: record,
    });
  }

  async function deleteRecord(mind, record) {
    const dir = await io.findMind(mind);

    await csvs.deleteRecord({
      fs,
      dir,
      query: record,
    });
  }

  return {
    csvsinit,
    select,
    selectStream,
    updateRecord,
    deleteRecord,
    buildRecord,
  };
}
