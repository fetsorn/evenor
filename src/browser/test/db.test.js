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

  const selectRecordStreamPull = vi.fn(
    ({ dir }) =>
      new ReadableStream({
        start(controller) {
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
      selectRecordStreamPull,
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
    const { done, value } = await selectStream(
      stub.mind,
      "streamid",
      stub.query,
    );

    expect(done).toEqual(false);

    expect(value).toEqual(stub.entry);

    expect(findMind).toHaveBeenCalled();

    expect(csvs.selectRecordStreamPull).toHaveBeenCalled();

    // TODO: test that previous stream is interrupted
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
