import csvs from "@fetsorn/csvs-js";
import { fs } from "./lightningfs.js";
import { findDir } from "./io.js";

export async function select(uuid, query) {
  const dir = await findDir(uuid);

  const overview = await csvs.selectRecord({
    fs,
    dir,
    query,
  });

  return overview;
}

export async function selectStream(uuid, query) {
  const dir = await findDir(uuid);

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

export async function updateRecord(uuid, record) {
  const dir = await findDir(uuid);

  await csvs.updateRecord({
    fs,
    dir,
    query: record,
  });
}

export async function deleteRecord(uuid, record) {
  const dir = await findDir(uuid);

  await csvs.deleteRecord({
    fs,
    dir,
    query: record,
  });
}
