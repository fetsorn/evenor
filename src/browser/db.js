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

  async function selectStream(mind, record) {
    const dir = await io.findMind(mind);

    return csvs.selectRecordStreamPull({
      fs,
      dir,
      query: record,
      light: true,
    });
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
