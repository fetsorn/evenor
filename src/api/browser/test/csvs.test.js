import { expect, test, describe, vi } from "vitest";
import csvs from "@fetsorn/csvs-js";
import { findMind } from "@/api/browser/io.js";
import {
  select,
  selectStream,
  updateRecord,
  deleteRecord,
} from "@/api/browser/csvs.js";
import stub from "./stub.js";

vi.mock("@/api/browser/io.js", async (importOriginal) => {
  const mod = await importOriginal();

  const findMind = vi.fn(async (mind) => {
    expect(mind).toBe(stub.mind);

    return stub.dir;
  });

  return {
    ...mod,
    findMind,
  };
});

vi.mock("@fetsorn/csvs-js", async (importOriginal) => {
  const mod = await importOriginal();

  const selectRecord = vi.fn(async ({ dir, query }) => {
    expect(dir).toBe(stub.dir);

    expect(query).toEqual(stub.query);

    return stub.records;
  });

  const selectRecordStream = vi.fn(
    ({ dir }) =>
      new TransformStream({
        transform(query, controller) {
          expect(dir).toBe(stub.dir);

          expect(query).toEqual(stub.query);

          controller.enqueue(stub.entry);
        },
      }),
  );

  const updateRecord = vi.fn(({ dir, query }) => {
    expect(dir).toBe(stub.dir);

    expect(query).toEqual(stub.entry);
  });

  const deleteRecord = vi.fn(({ dir, query }) => {
    expect(dir).toBe(stub.dir);

    expect(query).toEqual(stub.entry);
  });

  return {
    ...mod,
    default: {
      ...mod,
      selectRecord,
      selectRecordStream,
      updateRecord,
      deleteRecord,
    },
  };
});

describe("csvs", () => {
  test("select", async () => {
    const records = await select(stub.mind, stub.query);

    expect(findMind).toHaveBeenCalled();

    expect(csvs.selectRecord).toHaveBeenCalled();

    expect(records).toEqual(stub.records);
  });

  test("selectStream", async () => {
    const { strm } = await selectStream(stub.mind, stub.query);

    let records = [];

    const outputStream = new WritableStream({
      write(entry) {
        records.push(entry);
      },
    });

    await strm.pipeTo(outputStream);

    expect(findMind).toHaveBeenCalled();

    expect(csvs.selectRecordStream).toHaveBeenCalled();

    // TODO: test that previous stream is interrupted

    expect(records).toEqual(stub.records);
  });

  test("updateRecord", async () => {
    await updateRecord(stub.mind, stub.entry);

    expect(findMind).toHaveBeenCalled();

    expect(csvs.updateRecord).toHaveBeenCalled();
  });

  test("deleteRecord", async () => {
    await deleteRecord(stub.mind, stub.entry);

    expect(findMind).toHaveBeenCalled();

    expect(csvs.deleteRecord).toHaveBeenCalled();
  });
});
